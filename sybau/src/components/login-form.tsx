"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "@/api/lib/supabase-browser"

const GoogleIcon = () => (
  <Image
    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
    alt="Google Logo"
    width={20}
    height={20}
  />
);

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()
  
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/workspace',
      },
    }) 
  }
  
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold leading-none mb-2">Welcome back</h2>
          <p className="text-sm text-muted-foreground">
            Login with your Google account
          </p>
        </div>
        <form>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleLogin}
                type="button"
              >
                <GoogleIcon />
                <span className="ml-2">Login with Google</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
