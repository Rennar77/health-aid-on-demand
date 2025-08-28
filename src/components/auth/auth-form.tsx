import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Heart, Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"
import { useToast } from "@/hooks/use-toast"

const AuthForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      })
      setIsLoading(false)
      return
    }

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Account Created Successfully!",
        description: "Welcome to HealthTrack. You can now start tracking your health journey.",
        variant: "default"
      })
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
      })
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Welcome Back!",
        description: "Successfully logged in to your HealthTrack account.",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please check your email and password.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: `${provider} Authentication`,
        description: `Successfully authenticated with ${provider}.`,
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: `Failed to authenticate with ${provider}. Please try again.`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center py-16 gradient-hero">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center text-white mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Heart className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2">Join HealthTrack</h2>
            <p className="text-white/80">
              Start your journey to better health today
            </p>
          </div>

          <Card className="shadow-strong">
            <div className="p-6">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="mt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <label className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        <span>Remember me</span>
                      </label>
                      <Button variant="link" size="sm" className="p-0 text-primary">
                        Forgot password?
                      </Button>
                    </div>

                    <HeroButton 
                      variant="hero" 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </HeroButton>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="First name"
                            className="pl-10"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          className="pl-10 pr-10"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-10"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" required />
                      <Label className="text-sm">
                        I agree to the{" "}
                        <Button variant="link" className="p-0 h-auto text-primary">
                          Terms of Service
                        </Button>{" "}
                        and{" "}
                        <Button variant="link" className="p-0 h-auto text-primary">
                          Privacy Policy
                        </Button>
                      </Label>
                    </div>

                    <HeroButton 
                      variant="medical" 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </HeroButton>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <Separator />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleSocialAuth("Google")}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSocialAuth("Apple")}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.017 0C8.396 0 8.02.016 8.02.016 8.02.016 7.54 5.825 11.995 8.84c4.455-3.015 3.975-8.824 3.975-8.824s-.374-.016-3.954-.016zm.132 8.872C8.604 8.872 5.017 12.459 5.017 16.004c0 3.545 3.587 7.132 7.132 7.132s7.132-3.587 7.132-7.132c0-3.545-3.587-7.132-7.132-7.132z"/>
                  </svg>
                  Apple
                </Button>
              </div>
            </div>
          </Card>

          <div className="text-center text-white/80 text-sm mt-6">
            <p>
              Secure, HIPAA-compliant health data protection. 
              Your privacy is our priority.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AuthForm