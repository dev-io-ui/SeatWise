import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import FormField from "../components/ui/FormField.jsx";
import useAuthStore from "../store/useAuthStore.js";

const emailRules = {
  required: "Email is required.",
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Enter a valid email address.",
  },
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const auth = useAuthStore();
  const token = auth.token;

  const loginForm = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const registerForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const registerPassword = registerForm.watch("password");

  useEffect(() => {
    auth.clearError();
  }, [mode]);

  if (token) {
    return <Navigate to="/" replace />;
  }

  const switchMode = (nextMode) => {
    auth.clearError();
    loginForm.clearErrors();
    registerForm.clearErrors();
    setMode(nextMode);
  };

  const handleLogin = async (values) => {
    auth.clearError();
    await auth.login({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });
    navigate("/", { replace: true });
  };

  const handleRegister = async (values) => {
    auth.clearError();
    await auth.register({
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(240,138,36,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(30,95,175,0.12),transparent_26%),linear-gradient(180deg,#fffdf8_0%,#f8f4ec_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-6 lg:grid-cols-[1.08fr,0.92fr]">
        <section className="rounded-[2.5rem] bg-[#10304b] p-8 text-white shadow-panel sm:p-10 lg:p-12">
          <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/70">
            Exam Cell Admin Portal
          </div>

          <div className="mt-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent/90">SeatFlow</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Exam Hall Seating Allocation System
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/76">
              Manage student uploads, exam schedules, hall capacity, and seat allocation from a clean responsive
              dashboard built for day-to-day exam administration.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-4xl border border-white/10 bg-white/6 p-5">
              <ShieldCheck className="h-9 w-9 text-accent" />
              <h2 className="mt-4 text-lg font-bold">Secure Login</h2>
              <p className="mt-2 text-sm leading-6 text-white/68">Protected admin access with JWT authentication.</p>
            </div>
            <div className="rounded-4xl border border-white/10 bg-white/6 p-5">
              <UserPlus className="h-9 w-9 text-accent" />
              <h2 className="mt-4 text-lg font-bold">Simple Onboarding</h2>
              <p className="mt-2 text-sm leading-6 text-white/68">Create the first admin account and start managing exams.</p>
            </div>
            <div className="rounded-4xl border border-white/10 bg-white/6 p-5">
              <CheckCircle2 className="h-9 w-9 text-accent" />
              <h2 className="mt-4 text-lg font-bold">Ready for Use</h2>
              <p className="mt-2 text-sm leading-6 text-white/68">Bulk uploads, seat plans, and printable reports in one place.</p>
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/6 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/58">Included capabilities</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Register and log in as an exam admin",
                "Upload students and exam details in bulk",
                "Configure halls with capacity and layout",
                "Generate and print hall-wise seating charts",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-3xl bg-white/5 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <p className="text-sm text-white/74">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Card className="self-center bg-white/95 p-0 overflow-hidden">
          <div className="border-b border-line bg-gradient-to-r from-white to-primarySoft/35 px-6 py-6 sm:px-8">
            <div className="inline-flex items-center rounded-full bg-primarySoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {mode === "login" ? "Welcome Back" : "Create Admin Access"}
            </div>
            <h2 className="mt-4 text-3xl font-bold text-ink">
              {mode === "login" ? "Sign in to continue" : "Register your admin account"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {mode === "login"
                ? "Use your registered admin credentials to access the seating dashboard."
                : "Set up an admin account to manage students, halls, exams, and seating allocations."}
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-shell p-1.5">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  mode === "login" ? "bg-white text-primary shadow-sm" : "text-muted"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </span>
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  mode === "register" ? "bg-white text-accent shadow-sm" : "text-muted"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </span>
              </button>
            </div>

            {mode === "login" ? (
              <form className="space-y-5" noValidate onSubmit={loginForm.handleSubmit(handleLogin)}>
                <FormField
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  icon={<Mail className="h-4 w-4" />}
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register("email", emailRules)}
                />
                <FormField
                  label="Password"
                  type={showLoginPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  icon={<LockKeyhole className="h-4 w-4" />}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((current) => !current)}
                      className="rounded-full p-1 text-muted transition hover:bg-primarySoft hover:text-primary"
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register("password", {
                    required: "Password is required.",
                    minLength: { value: 6, message: "Password must be at least 6 characters." },
                  })}
                />

                <div className="rounded-3xl border border-line bg-shell/70 px-4 py-3 text-sm text-muted">
                  Access is limited to authorized examination administrators only.
                </div>

                {auth.error ? <p className="text-sm font-medium text-[#C2410C]">{auth.error}</p> : null}

                <Button type="submit" className="w-full" size="lg" loading={auth.loading}>
                  <ArrowRight className="h-4 w-4" />
                  Login to Dashboard
                </Button>
              </form>
            ) : (
              <form className="space-y-5" noValidate onSubmit={registerForm.handleSubmit(handleRegister)}>
                <FormField
                  label="Full Name"
                  autoComplete="name"
                  placeholder="Examination Admin"
                  icon={<User className="h-4 w-4" />}
                  error={registerForm.formState.errors.name?.message}
                  {...registerForm.register("name", {
                    required: "Name is required.",
                    minLength: { value: 2, message: "Name must be at least 2 characters." },
                  })}
                />
                <FormField
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  icon={<Mail className="h-4 w-4" />}
                  error={registerForm.formState.errors.email?.message}
                  {...registerForm.register("email", emailRules)}
                />
                <FormField
                  label="Password"
                  type={showRegisterPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  description="Use at least 6 characters."
                  icon={<LockKeyhole className="h-4 w-4" />}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword((current) => !current)}
                      className="rounded-full p-1 text-muted transition hover:bg-primarySoft hover:text-primary"
                      aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    >
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={registerForm.formState.errors.password?.message}
                  {...registerForm.register("password", {
                    required: "Password is required.",
                    minLength: { value: 6, message: "Password must be at least 6 characters." },
                  })}
                />
                <FormField
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  icon={<LockKeyhole className="h-4 w-4" />}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="rounded-full p-1 text-muted transition hover:bg-primarySoft hover:text-primary"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={registerForm.formState.errors.confirmPassword?.message}
                  {...registerForm.register("confirmPassword", {
                    required: "Please confirm your password.",
                    validate: (value) => value === registerPassword || "Passwords do not match.",
                  })}
                />

                <div className="rounded-3xl border border-[#ffd8b0] bg-accentSoft/55 px-4 py-3 text-sm text-[#A24E00]">
                  Register once and use the same credentials for future logins.
                </div>

                {auth.error ? <p className="text-sm font-medium text-[#C2410C]">{auth.error}</p> : null}

                <Button type="submit" className="w-full" size="lg" variant="accent" loading={auth.loading}>
                  <ArrowRight className="h-4 w-4" />
                  Create Account
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
