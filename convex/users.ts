import { MutationCtx, QueryCtx, internalMutation } from "./_generated/server";
import { ConvexError, v } from 'convex/values'

export async function getUser(
    ctx: QueryCtx | MutationCtx,
    tokenIdentifier: string 
    ){
        // console.log(tokenIdentifier)
    const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q)=>
        q.eq("tokenIdentifier", tokenIdentifier)
    )
    .first();
    console.log("USER",user?.tokenIdentifier)

    if(!user){
        throw new ConvexError("Expected user to defined!")
    }

    return user;
}
export const createUser = internalMutation({
    args:{ 
        tokenIdentifier: v.string(),
    },
    handler: async(ctx, args)=>{
        await ctx.db.insert("users",{
            tokenIdentifier: args.tokenIdentifier,
            orgIds: [],
        })
    }
})


// the reason why we are doing this is because  we want to authenticate the user
// and verfiy that ther ar authorized to upload a file to this orgId
export const addOrgIdToUser = internalMutation({
    args:{
        tokenIdentifier: v.string(),
        orgId: v.string(), 
    },
    handler: async(ctx,args)=>{
        const user = await getUser(ctx, args.tokenIdentifier);

        await ctx.db.patch(user._id,{
            orgIds: [...user.orgIds, args.orgId],
        })
    }
})