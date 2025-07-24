import React from "react";

function AboutUsPage() {
  const teamMembers = [
    {
      id: 1,
      name: "Alice Johnson",
      role: "Founder & Lead Developer",
      bio: "Passionate about open-source and building inclusive tech communities. Alice leads our development efforts and strategic vision.",
      image: "https://via.placeholder.com/150/007bff/ffffff?text=AJ", // Placeholder image
    },
    {
      id: 2,
      name: "Bob Williams",
      role: "Community Manager",
      bio: "A seasoned event organizer and community builder. Bob ensures our members feel connected and supported.",
      image: "https://via.placeholder.com/150/28a745/ffffff?text=BW", // Placeholder image
    },
    {
      id: 3,
      name: "Charlie Davis",
      role: "Content & Education Lead",
      bio: "Dedicated to creating high-quality learning resources and workshops for our members.",
      image: "https://via.placeholder.com/150/ffc107/333333?text=CD", // Placeholder image
    },
    {
      id: 4,
      name: "Diana Garcia",
      role: "Partnerships & Outreach",
      bio: "Connects Scriptly with industry leaders and organizations to bring new opportunities to our community.",
      image: "https://via.placeholder.com/150/17a2b8/ffffff?text=DG", // Placeholder image
    },
  ];

  return (
    <div className="py-12 bg-gray-50 min-h-[calc(100vh-140px)]">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12 bg-gradient-to-r from-blue-500 to-teal-500 p-8 rounded-xl shadow-lg">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            About <span className="block md:inline">Scriptly Community</span>
          </h1>
          <p className="text-lg md:text-xl text-white opacity-90 max-w-2xl mx-auto">
            Connecting developers, fostering growth, and building the future of
            code together.
          </p>
        </div>

        {/* Mission & Vision Section */}
        <section className="mb-12 bg-white p-8 rounded-xl shadow-md border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Our <span className="text-blue-600">Mission</span> &{" "}
            <span className="text-blue-600">Vision</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3 flex items-center">
                <span className="text-blue-500 mr-3">🚀</span>Our Mission
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                To empower aspiring and experienced developers by providing a
                vibrant, collaborative, and inclusive platform for learning,
                sharing knowledge, and building impactful projects. We strive to
                break down barriers to entry in tech and foster continuous
                growth.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3 flex items-center">
                <span className="text-teal-500 mr-3">💡</span>Our Vision
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                To be the leading global community for developers, recognized
                for our innovative educational resources, impactful
                collaborative projects, and a supportive network that cultivates
                the next generation of tech leaders and innovators.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section (Optional - to add more depth) */}
        <section className="mb-12 bg-white p-8 rounded-xl shadow-md border border-green-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Our <span className="text-green-600">Core Values</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-lg bg-green-50 shadow-sm border border-green-200">
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                Collaboration
              </h3>
              <p className="text-gray-600 text-sm">
                We believe in the power of working together.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 shadow-sm border border-green-200">
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                Inclusivity
              </h3>
              <p className="text-gray-600 text-sm">
                A welcoming space for everyone, regardless of background.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 shadow-sm border border-green-200">
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                Continuous Learning
              </h3>
              <p className="text-gray-600 text-sm">
                Embracing new technologies and personal growth.
              </p>
            </div>
          </div>
        </section>

        {/* Team Members Section */}
        <section className="bg-white p-8 rounded-xl shadow-md border border-purple-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Meet Our <span className="text-purple-600">Team</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="text-center bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-purple-300 shadow"
                />
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {member.name}
                </h3>
                <p className="text-purple-600 font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutUsPage;
