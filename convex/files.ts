// Mutations insert, update and remove data from the database, check authentication or perform other business logic, and optionally return a response to the client application.
import { ConvexError, v } from 'convex/values'
import {MutationCtx, QueryCtx, mutation, query} from './_generated/server'
import { getUser } from './users';
import { fileTypes } from './schema';
import { Id } from './_generated/dataModel';

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
        orgId: v.string(),
        query: v.optional(v.string()),
        favorites: v.optional(v.boolean()),
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
        let files = await ctx.db
            .query("files")
            .withIndex("by_orgId",(q)=>q.eq('orgId', args.orgId))
            .collect();

        const query = args.query;

        if(query){
            files= files.filter((file)=>
                file.name.toLowerCase().includes(query.toLowerCase()))  
        }

        if(args.favorites){
            const user = await ctx.db
                .query("users")
                .withIndex("by_tokenIdentifier", (q)=> 
                q.eq("tokenIdentifier", identity.tokenIdentifier))
                .first()
            
            if(!user){
                return files
            }
        
            const favorites = await ctx.db
                .query("favorites")
                .withIndex("by_userId_orgId_fileId", (q)=>
                    q.eq("userId", user._id)
                    .eq("orgId", args.orgId)
                )
                .collect()
            
            files = files.filter((file)=>
                favorites.some((favorite)=>favorite.fileId === file._id))
        }

        return files
    }
})

export const deleteFile = mutation({
    args:{
        fileId: v.id("files")
    },
    handler: async(ctx,args)=>{
        
        const access = await hasAccessToFile(ctx,args.fileId)
        if(!access){
            throw new ConvexError("You do not have access to this file")
        }
        await ctx.db.delete(args.fileId)
    
}})

export const toggleFavorite = mutation({
    args: { fileId: v.id("files") },
    async handler(ctx, args) {
      const access = await hasAccessToFile(ctx, args.fileId);
  
      if (!access) {
        throw new ConvexError("no access to file");
      }
  
      const favorite = await ctx.db
        .query("favorites")
        .withIndex("by_userId_orgId_fileId", (q) =>
          q
            .eq("userId", access.user._id)
            .eq("orgId", access.file.orgId)
            .eq("fileId", access.file._id)
        )
        .first();
  
      if (!favorite) {
        await ctx.db.insert("favorites", {
          fileId: access.file._id,
          userId: access.user._id,
          orgId: access.file.orgId,
        });
      } else {
        await ctx.db.delete(favorite._id);
      }
    },
  });
  

export const hasAccessToFile= async(
    ctx: QueryCtx | MutationCtx,
    fileId: Id<"files">
)=>{
    const identity = await ctx.auth.getUserIdentity();
    
    console.log("IDENTITY",identity)
    if(!identity)return null
    
    const file = await ctx.db.get(fileId)
    console.log("FILE",file)
    
    if(!file)return null
    
    const hasAccess = await hasAccessOrg(
        ctx,
        identity.tokenIdentifier,
        file.orgId
        )
        
        console.log("HASACCESS",hasAccess)
        if(!hasAccess)return null
        
    const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q)=> 
    q.eq("tokenIdentifier", identity.tokenIdentifier))
    .first()
        
    console.log("USER",user)
    if(!user) return null

    return {user, file};
}