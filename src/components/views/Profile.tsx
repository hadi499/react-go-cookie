import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { z } from "zod";

// Zod Schema
const profileSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.union([
    z.string().min(6, "Password minimal 6 karakter"),
    z.undefined(),
  ]),
});

type ProfileType = z.infer<typeof profileSchema>;
type ErrorType = Record<string, string>;

export default function Profile() {
  const [profile, setProfile] = useState<ProfileType>({
    username: "",
    email: "",
    password: undefined,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<ErrorType>({});
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8080/profile/${id}`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();

        const { password, ...userWithoutPassword } = data.user;
        setProfile(userWithoutPassword);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const normalizeErrors = (zodError: z.ZodError): ErrorType => {
    const errorObj: ErrorType = {};
    zodError.errors.forEach((err) => {
      if (err.path.length > 0) {
        errorObj[err.path[0] as string] = err.message;
      }
    });
    return errorObj;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    try {
      const validationResult = profileSchema.safeParse(profile);
      if (!validationResult.success) {
        setErrors(normalizeErrors(validationResult.error));
        return;
      }

      if (!id) throw new Error("User ID not found");

      const { password, ...updatedProfile } = profile;
      const payload = password
        ? { ...updatedProfile, password }
        : updatedProfile;

      const response = await fetch(`http://localhost:8080/profile/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      setMessage("Profile updated successfully");
      setProfile(data.user);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-32">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      {message && <p className="mb-4 text-green-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
          {errors.username && (
            <p className="text-red-500 mt-1">{errors.username}</p>
          )}
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
          {errors.email && <p className="text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={profile.password ?? ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
          {errors.password && (
            <p className="text-red-500 mt-1">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}
