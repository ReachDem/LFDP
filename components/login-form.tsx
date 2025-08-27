'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GalleryVerticalEnd } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient } from '@/lib/auth-client';


export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			await authClient.signIn.email({
				email,
				password,
				callbackURL: '/home'
			});
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'La connexion a échoué');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link href="/" className="flex items-center gap-2 font-semibold">
						<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<GalleryVerticalEnd className="size-4" />
						</div>
						LFDP.
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<form onSubmit={handleLogin} className="flex flex-col gap-6">
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">La force du planteur.</h1>
								<p className="text-balance text-sm text-muted-foreground">
									Entrez vos identifiants pour vous connecter
								</p>
							</div>

							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className="grid gap-6">
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="m@exemple.com"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
									/>
								</div>
								<div className="grid gap-2">
									<div className="flex items-center">
										<Label htmlFor="password">Mot de passe</Label>
										<a
											href="/contact-admin"
											className="ml-auto text-sm underline-offset-4 hover:underline"
										>
											Mot de passe oublié ?
										</a>
									</div>
									<Input
										id="password"
										type="password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
									/>
								</div>
								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? 'Connexion en cours...' : 'Se connecter'}
								</Button>

							</div>
							<div className="text-center text-sm">
								Vous n&apos;avez pas de compte ?{" "}
								<a href="/contact" className="underline underline-offset-4">
									Contacter l&apos;admin
								</a>
							</div>
						</form>
					</div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<Image
					src="/LFDP.png"
					alt="La Force du Planteur Logo"
					fill
					className="object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}