import { OrganizationSwitcher, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const Header = () => {
    return (
        <div className="border-b py-4 bg-gray-50">
            <div className="items-center container mx-auto justify-between flex">
                <div>
                    FileDrive
                </div>
                <div className="flex gap-2">
                    <OrganizationSwitcher/>
                    <UserButton/>
                    {/* CLERK default signed out check: checks if the user is signed out then show clerk signinbutton which is wrapped inside a shadcnui button for designing. */}
                    <SignedOut>
                        <SignInButton>
                            <Button>
                                Sign In
                            </Button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </div>
        </div>
    );
}

