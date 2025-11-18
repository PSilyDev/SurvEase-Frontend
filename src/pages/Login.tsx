import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../api/client";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(3)
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema)
  });
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";  // 👈 where to go after login

  async function onSubmit(values: Form) {
    try {
      const res = await api.post("/user-api/user", values);
      if (res.data?.token) {
        login(res.data.user, res.data.token);
        nav(from, { replace: true }); // 👈 go back to /create automatically
      } else {
        toast.error(res.data?.payload || "Login failed");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Login failed");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>

      <div>
        <label className="text-sm font-medium">Username</label>
        <input className="mt-1 w-full rounded-lg border px-3 py-2" {...register("username")} />
        {errors.username && <p className="text-xs text-red-600">{errors.username.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Password</label>
        <input type="password" className="mt-1 w-full rounded-lg border px-3 py-2" {...register("password")} />
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <button disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-white">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
      <p className="mt-3 text-center text-sm text-gray-600">
        New here? <Link to="/signup" className="text-blue-600 hover:underline">Create an account</Link>
      </p>
    </form>
  );
}
