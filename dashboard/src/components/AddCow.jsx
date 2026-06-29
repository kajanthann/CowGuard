import React, { useState } from "react";

const AddCow = () => {
  const [form, setForm] = useState({
    cowId: "",
    name: "",
    breed: "",
    deviceId: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setSuccess("");

//     try {
//       await set(ref(db, `cows/${form.cowId}`), {
//         cowId: form.cowId,
//         name: form.name,
//         breed: form.breed,
//         deviceId: form.deviceId,
//       });

//       setSuccess("🐄 Cow added successfully!");

//       setForm({
//         cowId: "",
//         name: "",
//         breed: "",
//         deviceId: "",
//       });
//     } catch (err) {
//       console.error(err);
//       setSuccess("❌ Error adding cow");
//     }

//     setLoading(false);
//   };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-gray-500 shadow-md">

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Add New Cow
      </h2>

      <form className="space-y-4">

        {/* Cow ID */}
        <input
          type="text"
          name="cowId"
          placeholder="Cow ID (e.g. COW_01)"
          value={form.cowId}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          required
        />

        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Cow Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          required
        />

        {/* Breed */}
        <input
          type="text"
          name="breed"
          placeholder="Breed (e.g. Jersey)"
          value={form.breed}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />

        {/* Device ID */}
        <input
          type="text"
          name="deviceId"
          placeholder="Device ID (ESP32 MAC)"
          value={form.deviceId}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Adding..." : "Add Cow"}
        </button>

        {/* Status */}
        {success && (
          <p className="text-center text-sm mt-2 text-gray-700">
            {success}
          </p>
        )}

      </form>
    </div>
  );
};

export default AddCow;