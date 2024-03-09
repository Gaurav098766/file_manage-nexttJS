import { internalMutation } from "./_generated/server";
import { v } from 'convex/values'


export const createUser = internalMutation({
    args:{ tokenIdentifier: v.string()},
    handler: async(ctx, args)=>{
        await ctx.db.insert("users",{
            tokenIdentifier: args.tokenIdentifier
        })
    }
})