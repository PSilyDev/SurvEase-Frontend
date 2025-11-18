import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../api/client";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const schema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().optional(),
  username: z.string().min(4, "Min 4 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(6, "Min 6 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Use letters & numbers"),
  confirmPassword: z.string()
}).refine((v) => v.password === v.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type Form = z.infer<typeof schema>;

export default function Signup() {
  const { login } = useAuth();
  const nav = useNavigate();

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Form) {
    try {
      // 1) Create account
      const res = await api.post("/user-api/users", {
        first_name: values.first_name,
        last_name: values.last_name,
        username: values.username,
        email: values.email,
        password: values.password
      });

      if (res.status === 201) {
        toast.success("Account created! Signing you in…");

        // 2) Auto-login
        const loginRes = await api.post("/user-api/user", {
          username: values.username,
          password: values.password
        });

        if (loginRes.data?.token) {
          login(loginRes.data.user, loginRes.data.token);
          nav("/", { replace: true });
        } else {
          toast.error("Signup succeeded, but login failed. Please login manually.");
          nav("/login");
        }
      } else {
        toast.error(res.data?.payload || "Signup failed");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.payload ||
        e?.response?.data?.message ||
        "Signup failed";
      toast.error(msg);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-semibold">Create your account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">First name</label>
            <input className="mt-1 w-full rounded-lg border px-3 py-2" {...register("first_name")} />
            {errors.first_name && <p className="text-xs text-red-600">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Last name (optional)</label>
            <input className="mt-1 w-full rounded-lg border px-3 py-2" {...register("last_name")} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Username</label>
          <input className="mt-1 w-full rounded-lg border px-3 py-2" {...register("username")} />
          {errors.username && <p className="text-xs text-red-600">{errors.username.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" className="mt-1 w-full rounded-lg border px-3 py-2" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" className="mt-1 w-full rounded-lg border px-3 py-2" {...register("password")} />
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            <p className="mt-1 text-xs text-gray-500">Use at least 6 chars, include letters & numbers.</p>
          </div>
          <div>
            <label className="text-sm font-medium">Confirm password</label>
            <input type="password" className="mt-1 w-full rounded-lg border px-3 py-2" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <button
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? "Creating…" : "Create account"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
