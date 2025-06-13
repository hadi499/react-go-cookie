import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import {
  profileSchema,
  type ProfileType,
  type ErrorType,
} from "../../zod-schema/profileSchema";

export default function Profile() {
  const [profile, setProfile] = useState<ProfileType>({
    username: "",
    email: "",
    password: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    const result = profileSchema.safeParse(profile);
    if (!result.success) {
      const fieldErrors = Object.fromEntries(
        result.error.errors.map((e) => [e.path[0] as string, e.message])
      );
      setErrors(fieldErrors);
      return;
    }

    try {
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
