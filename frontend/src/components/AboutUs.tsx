import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FaHeart,
  FaUserMd,
  FaPills,
  FaCalendarAlt,
  FaShieldAlt,
  FaLightbulb,
} from "react-icons/fa";

function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4">
            About Our Healthcare Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Empowering healthier communities through innovative technology and
            compassionate care
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-purple-600 dark:text-blue-400 flex items-center justify-center gap-2">
              <FaHeart className="text-red-500" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 dark:text-gray-300 text-center leading-relaxed">
              To revolutionize healthcare delivery by connecting patients,
              doctors, and pharmacists through a comprehensive digital platform
              that makes quality healthcare accessible, affordable, and
              convenient for everyone.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <FaUserMd />
                Expert Healthcare Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with qualified doctors and healthcare professionals for
                consultations, diagnoses, and ongoing care management.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <FaPills />
                Integrated Pharmacy Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Seamless prescription management and medication delivery through
                our network of trusted pharmacy partners.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <FaCalendarAlt />
                Easy Appointment Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Book appointments with healthcare providers at your convenience
                with our intuitive scheduling system.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <FaShieldAlt />
                Secure & Private
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Your health data is protected with enterprise-grade security and
                full compliance with healthcare privacy regulations.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <FaLightbulb />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Get personalized health recommendations and insights powered by
                advanced artificial intelligence and machine learning.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                💬 Real-time Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Instant messaging and video consultations for immediate
                healthcare support when you need it most.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-purple-600 dark:text-purple-400">
              Our Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 text-lg px-4 py-2">
                  Compassion
                </Badge>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We care deeply about every patient's wellbeing
                </p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 text-lg px-4 py-2">
                  Innovation
                </Badge>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Continuously improving healthcare through technology
                </p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 text-lg px-4 py-2">
                  Accessibility
                </Badge>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Making healthcare available to everyone, everywhere
                </p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 text-lg px-4 py-2">
                  Excellence
                </Badge>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Delivering the highest quality of care and service
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Section */}
        <Card className="mb-8 shadow-lg bg-gradient-to-r from-purple-500 to-purple-800 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Our Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <h3 className="text-4xl font-bold">10,000+</h3>
                <p className="text-lg">Patients Served</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold">500+</h3>
                <p className="text-lg">Healthcare Providers</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold">100+</h3>
                <p className="text-lg">Partner Pharmacies</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold">50,000+</h3>
                <p className="text-lg">Consultations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center shadow-lg">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Ready to Transform Your Healthcare Experience?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join thousands of patients who have already discovered a better
              way to manage their health.
            </p>
            <div className="space-x-4">
              <button className="animate-pulse bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Get Started Today
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Learn More
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AboutUs;
