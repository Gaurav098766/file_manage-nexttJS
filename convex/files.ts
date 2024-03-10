// Mutations insert, update and remove data from the database, check authentication or perform other business logic, and optionally return a response to the client application.
import { ConvexError, v } from 'convex/values'
import {MutationCtx, QueryCtx, mutation, query} from './_generated/server'
import { getUser } from './users';
import { fileTypes } from './schema';

export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if(!identity){
        throw new ConvexError("You must be logged in to upload file")
    }
    return await ctx.storage.generateUploadUrl();
});

export const hasAccessOrg = async(
    ctx: QueryCtx | MutationCtx,
    tokenIdentifier: string,
    orgId: string
)=>{
        const user = await getUser(ctx, tokenIdentifier)
         // IMP: A user can has his 
            // i) own account and creating a file at that time the args.orgId is eg: user_2dReKtJEYWomTi0HWnyZdtqXgwx so the user tokenidentifier will be matched in this case beavuse userid and orgid will never match(2nd condition of hasaccess will be matched)
            // ii) when user is in some organization and creating a file at that time the args.orgId is eg: org_2dReN6nyGvhsecxzWInmw0NBFr2 so the user.orgIds will be matched in this case beavuse user.identifiertoken and orgid will never match(1st condition of hasaccess will be matched)
        const hasAccess = 
            user.orgIds.includes(orgId) || 
            user.tokenIdentifier.includes(orgId)
        return hasAccess;
}

export const createFile = mutation({
    args:{
        name: v.string(),
        type: fileTypes,
        fileId: v.id("_storage"),
        orgId: v.string()
    },
    handler: async(ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new ConvexError("You must be logged in to upload file")
        }

        const hasAccess = await hasAccessOrg(ctx,identity.tokenIdentifier,args.orgId)

        if (!hasAccess ){
            throw new ConvexError("You do not have access to this org")
        }

        await ctx.db.insert('files',{
            name: args.name,
            type: args.type,
            orgId: args.orgId,
            fileId: args.fileId,
        })
    }
})


export const getFiles = query({
    args:{
        orgId: v.string()
    },
    handler: async(ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            return []
        }

        const hasAccess = await hasAccessOrg(ctx,identity.tokenIdentifier,args.orgId)

        if(!hasAccess){
            throw new ConvexError("You do not have access to this org")
        }
        return ctx.db
            .query("files")
            .withIndex("by_orgId",(q)=>q.eq('orgId', args.orgId))
            .collect();
    }
})

export const deleteFile = mutation({
    args:{
        fileId: v.id("files")
    },
    handler: async(ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();
        
        if(!identity){
            throw new ConvexError("You must be logged in to upload file")
        }

        const file = await ctx.db.get(args.fileId)

        if(!file){
            throw new ConvexError("This file does not exist")
        }

        const hasAccess = await hasAccessOrg(
            ctx,
            identity.tokenIdentifier,
            file.orgId
        )

        if(!hasAccess){
            throw new ConvexError("You do not have access to delete this file")
        }

        await ctx.db.delete(args.fileId)
    
}})