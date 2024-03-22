import { MutationCtx, QueryCtx, internalMutation, query } from "./_generated/server";
import { ConvexError, v } from 'convex/values'
import { roles } from "./schema";

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
    // console.log("USER",user?.tokenIdentifier)

    if(!user){
        throw new ConvexError("Expected user to defined!")
    }

    return user;
}


export const createUser = internalMutation({
    args:{ 
        tokenIdentifier: v.string(),
        name: v.string(),
        image: v.string(),
    },
    handler: async(ctx, args)=>{
        await ctx.db.insert("users",{
            tokenIdentifier: args.tokenIdentifier,
            orgIds: [],
            name: args.name,
            image: args.image,
        })
    }
})


export const updateUser = internalMutation({
    args:{ 
        tokenIdentifier: v.string(),
        name: v.string(),
        image: v.string(),
    },
    handler: async(ctx, args)=>{

        const user = await getUser(ctx, args.tokenIdentifier);
    
        await ctx.db.patch(user._id,{
            name:args.name,
            image: args.image
        });
    }
})

// the reason why we are doing this is because  we want to authenticate the user
// and verfiy that ther ar authorized to upload a file to this orgId
export const addOrgIdToUser = internalMutation({
    args:{
        tokenIdentifier: v.string(),
        orgId: v.string(), 
        role: roles
    },
    handler: async(ctx,args)=>{
        const user = await getUser(ctx, args.tokenIdentifier);

        await ctx.db.patch(user._id,{
            orgIds: [...user.orgIds, {orgId: args.orgId, role: args.role}],
        })
    }
})

export const updateRoleInOrgForUser = internalMutation({
    args:{
        tokenIdentifier: v.string(),
        orgId: v.string(), 
        role: roles
    },
    handler: async(ctx,args)=>{
        const user = await getUser(ctx, args.tokenIdentifier);

        const org = user.orgIds.find((org) => org.orgId === args.orgId);
        
        if(!org){
            throw new ConvexError("Expected an org on the user but was not found when updating")
        }

        org.role = args.role


        await ctx.db.patch(user._id,{
            orgIds: user.orgIds,
        })
    }
})

export const getUserProfile = query({
    args:{
        userId: v.id("users"),
    },
    async handler(ctx,args) {
        const user = await ctx.db.get(args.userId)

        return{
            name: user?.name,
            image: user?.image,
        }
    }
})


export const getMe = query({
    args:{},
    async handler(ctx){
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            return null;
        }

        const user = await getUser(ctx, identity.tokenIdentifier)

        if(!user){
            return null
        }

        return user
    }
})