// Mutations insert, update and remove data from the database, check authentication or perform other business logic, and optionally return a response to the client application.
import { ConvexError, v } from 'convex/values'
import {mutation, query} from './_generated/server'

export const createFile = mutation({
    args:{
        name: v.string(),
        orgId: v.string()
    },
    handler: async(ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();
        console.log(identity)
        if(!identity){
            throw new ConvexError("You must be logged in to upload file")
        }

        await ctx.db.insert('files',{
            name: args.name,
            orgId: args.orgId,
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
        return ctx.db
            .query("files")
            .withIndex("by_orgId",(q)=>q.eq('orgId', args.orgId))
            .collect();
    }
})

 