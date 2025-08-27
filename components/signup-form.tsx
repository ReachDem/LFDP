'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { useState, FormEvent } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SignUpForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [email, setEmail] = useState("")
	const [name, setName] = useState("")
	const [password, setPassword] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)

		if (!email || !password || !name) {
			setError("Veuillez remplir tous les champs")
			setIsLoading(false)
			return
		}

		try {
			const { data, error } = await authClient.signUp.email({
				email,
				password,
				name, // Adding the required name field
				callbackURL: '/dashboard'
			}, {
				onRequest: () => {
					// show loading is handled by state
				},
				onSuccess: () => {
					// Redirect to dashboard or sign in page after successful signup
				},
				onError: (ctx) => {
					// Set the error message
					setError(ctx.error.message)
				},
			});
		} catch (err) {
			console.error(err)
			setError(err instanceof Error ? err.message : "Erreur lors de l'inscription")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form className="p-6 md:p-8" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-6">
							<div className="flex flex-col items-center text-center">
								<h1 className="text-2xl font-bold">Bienvenue.</h1>
								<p className="text-muted-foreground text-balance">
									Creer un compte administrateur.
								</p>
							</div>

							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className="grid gap-3">
								<Label htmlFor="name">Nom</Label>
								<Input
									id="name"
									type="text"
									placeholder="John Doe"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>

							<div className="grid gap-3">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>
							
							<div className="grid gap-3">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
								</div>
								<Input
									id="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isLoading}
								/>
							</div>
							
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Création en cours..." : "Créer un compte"}
							</Button>

							<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
								<span className="bg-card text-muted-foreground relative z-10 px-2">
									Or continue with
								</span>
							</div>
							<div className="grid grid-cols-1 gap-4">
								<Button variant="outline" type="button" className="w-full" disabled>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
										<path
											d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
											fill="currentColor"
										/>
									</svg>
									Login with Google
									<span className="sr-only">Login with Google</span>
								</Button>
							</div>
							<div className="text-center text-sm">
								Vous avez deja un compte ?{" "}
								<a href="/login" className="underline underline-offset-4">
									Connectez-vous
								</a>
							</div>
						</div>
					</form>
					<div className="bg-muted relative hidden md:block">
						<img
							src="/LFDP.png"
							alt="Image"
							className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
						/>
					</div>
				</CardContent>
			</Card>
			<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
				En cliquant sur "creer un compte", vous acceptez nos <a href="#">Termes Service</a>{" "}
				and <a href="#">Privacy Policy</a>.
			</div>
		</div>
	)
}
