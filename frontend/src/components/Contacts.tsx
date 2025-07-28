import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaHeadset,
  FaUserMd,
  FaAmbulance,
} from "react-icons/fa";

function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    urgency: "general",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      urgency: "general",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're here to help! Reach out to us for any questions, support, or
            emergency assistance.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Emergency Contact */}
            <Card className="shadow-lg border-red-200 dark:border-red-800">
              <CardHeader className="bg-red-50 dark:bg-red-900/20">
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                  <FaAmbulance />
                  Emergency Support
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-red-500" />
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      911 (Emergency)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-red-500" />
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      +254-700-URGENT
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Available 24/7 for medical emergencies
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* General Contact */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <FaHeadset />
                  General Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-purple-500" />
                    <div>
                      <p className="font-semibold">+254-700-HEALTH</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Main Support Line
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-green-500" />
                    <div>
                      <p className="font-semibold">
                        support@healthcareapp.co.ke
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        General Inquiries
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaUserMd className="text-purple-500" />
                    <div>
                      <p className="font-semibold">
                        doctors@healthcareapp.co.ke
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Medical Inquiries
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-red-500 mt-1" />
                    <div>
                      <p className="font-semibold">Healthcare Plaza</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Nairobi CBD, Kenya
                        <br />
                        P.O. Box 12345-00100
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2">
                  <FaClock />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-semibold">8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Note:</strong> Emergency services available 24/7
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-purple-600 dark:text-purple-400">
                  Follow Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    <FaFacebook />
                  </button>
                  <button className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors">
                    <FaTwitter />
                  </button>
                  <button className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors">
                    <FaLinkedin />
                  </button>
                  <button className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors">
                    <FaInstagram />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 dark:text-white">
                  Send Us a Message
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+254-XXX-XXXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="urgency">Priority Level</Label>
                      <select
                        id="urgency"
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="appointment">Appointment Related</option>
                        <option value="billing">Billing Question</option>
                        <option value="technical">Technical Support</option>
                        <option value="urgent">Urgent (Non-Emergency)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Send Message
                    </Button>
                    <Badge variant="secondary" className="text-sm">
                      We typically respond within 24 hours
                    </Badge>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800 dark:text-white">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg mb-2 text-blue-600 dark:text-blue-400">
                  How do I book an appointment?
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You can book appointments through our platform by selecting
                  your preferred doctor, date, and time slot. Our system will
                  confirm your booking immediately.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2 text-green-600 dark:text-green-400">
                  Is my health data secure?
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Yes, we use enterprise-grade encryption and comply with all
                  healthcare privacy regulations to keep your data completely
                  secure and confidential.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2 text-purple-600 dark:text-purple-400">
                  How do prescriptions work?
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  After your consultation, prescriptions are sent directly to
                  your chosen pharmacy. You can track the status and arrange
                  delivery through our platform.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2 text-red-600 dark:text-red-400">
                  What about emergency situations?
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  For life-threatening emergencies, call 911 immediately. For
                  urgent non-emergency medical issues, use our emergency
                  hotline: +254-700-URGENT.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ContactUs;
