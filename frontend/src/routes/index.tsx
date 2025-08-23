import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  Pill,
  Video,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Package,
  BarChart3,
  User,
} from "lucide-react";
import { ChatBubble } from "@/components/ChatBubble";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  features: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  imagePosition: "left" | "right";
}

const HealthcareLanding: React.FC = () => {
  const { user } = useAuth();

  const handleDashboardRedirect = () => {
    if (user) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/auth";
    }
  };
  const services: Service[] = [
    {
      id: "appointments",
      title: "Doctor Appointment Services",
      description:
        "Streamline the appointment process and reduce long physical queues. Patients can access doctor lists, check availability, view empty slots and schedule appointments with ease.",
      icon: <Calendar className="w-8 h-8" />,
      features: [
        "Consultation cause selection",
        "Fee transparency and payment",
        "Real-time doctor availability",
      ],
      color: "purple",
    },
    {
      id: "pharmacy",
      title: "Pharmacy App Development",
      description:
        "Designed for pharmacy owners with features like inventory tracking, medicine ordering, and prescription management. Maintain stock in real-time and process online medicine orders.",
      icon: <Pill className="w-8 h-8" />,
      features: [
        "Real-time inventory management",
        "Digital prescription processing",
        "Online medicine ordering system",
      ],
      color: "purple",
    },
    {
      id: "telemedicine",
      title: "Telemedicine Services",
      description:
        "Connect patients and healthcare providers remotely. Get online prescriptions without visiting a facility, order medicine, maintain medical records, and make online payments.",
      icon: <Video className="w-8 h-8" />,
      features: [
        "Secure video consultations",
        "Digital prescription delivery",
        "Integrated medical records",
      ],
      color: "purple",
    },
  ];

  const benefits: Benefit[] = [
    {
      id: "compliance",
      title: "Regulatory Compliance",
      description:
        "All solutions are developed with strict adherence to HIPAA and other healthcare regulations.",
      icon: <Shield className="w-8 h-8" />,
    },
    {
      id: "efficiency",
      title: "Operational Efficiency",
      description:
        "Streamline workflows and reduce administrative burden for healthcare staff.",
      icon: <Zap className="w-8 h-8" />,
    },
    {
      id: "experience",
      title: "Enhanced Patient Experience",
      description:
        "Improve patient satisfaction with convenient digital access to healthcare services.",
      icon: <Users className="w-8 h-8" />,
    },
    {
      id: "insights",
      title: "Data-Driven Insights",
      description:
        "Leverage analytics to make informed decisions and improve healthcare outcomes.",
      icon: <TrendingUp className="w-8 h-8" />,
    },
  ];

  const serviceDetails: ServiceDetail[] = [
    {
      id: "appointment-detail",
      title: "Doctor Appointment Service",
      description:
        "Our doctor appointment mobile apps are specifically designed for patients and doctors to streamline the appointment process and eliminate long physical queues.",
      features: [
        {
          icon: <User className="w-5 h-5" />,
          title: "Comprehensive Doctor Listings",
          description:
            "Access detailed information about doctors including specialties, experience, and patient reviews.",
        },
        {
          icon: <Clock className="w-5 h-5" />,
          title: "Real-time Availability",
          description:
            "View doctor availability by the entire week and book appointments in real-time slots.",
        },
        {
          icon: <CreditCard className="w-5 h-5" />,
          title: "Transparent Fee Structure",
          description:
            "Clear information about consultation fees and secure online payment options.",
        },
      ],
      imagePosition: "right",
    },
    {
      id: "pharmacy-detail",
      title: "Pharmacy App Development",
      description:
        "Advanced solutions designed for pharmacy owners with features like inventory tracking, medicine ordering, and prescription management.",
      features: [
        {
          icon: <Package className="w-5 h-5" />,
          title: "Inventory Management",
          description:
            "Track medicine stock in real-time with automated alerts for low inventory levels.",
        },
        {
          icon: <BarChart3 className="w-5 h-5" />,
          title: "Analytics Dashboard",
          description:
            "Comprehensive insights into sales, inventory turnover, and customer patterns.",
        },
      ],
      imagePosition: "left",
    },
  ];

  const Limage: React.FC<{
    className?: string;
    variant?: "purple" | "blue";
    imageSrc?: string;
    altText?: string;
  }> = ({
    className = "",
    imageSrc = "/Purple%20robot.jpg",
    altText = "Healthcare Robot Assistant",
  }) => (
    <div className={`relative ${className}`}>
      <div className="w-48 h-64 sm:w-56 sm:h-80 md:w-64 md:h-96 rounded-3xl overflow-hidden shadow-2xl bg-gray-200 dark:bg-gray-700 transition-colors duration-300">
        <img
          src={imageSrc}
          alt={altText}
          className="w-full h-full object-cover rounded-3xl"
          onError={(e) => {
            console.log(`Failed to load image: ${imageSrc}`);
            e.currentTarget.src = "/Purple%20robot.jpg";
          }}
          onLoad={() => {
            console.log(`Successfully loaded image: ${imageSrc}`);
          }}
        />
      </div>
    </div>
  );

  const Image2: React.FC<{
    className?: string;
    variant?: "purple" | "blue";
    imageSrc?: string;
    altText?: string;
  }> = ({
    className = "",
    imageSrc = "/download.jpg",
    altText = "Healthcare Robot Assistant",
  }) => (
    <div className={`relative ${className}`}>
      <div className="w-48 h-64 sm:w-56 sm:h-80 md:w-64 md:h-96 rounded-3xl overflow-hidden shadow-2xl bg-gray-200 dark:bg-gray-700 transition-colors duration-300">
        <img
          src={imageSrc}
          alt={altText}
          className="w-full h-full object-cover rounded-3xl"
          onError={(e) => {
            console.log(`Failed to load image: ${imageSrc}`);
            e.currentTarget.src = "/Purple%20robot.jpg";
          }}
          onLoad={() => {
            console.log(`Successfully loaded image: ${imageSrc}`);
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* <Navigation /> */}

      <section
        className="bg-white dark:bg-gray-800 pt-24 pb-16 md:py-20 lg:py-24 relative bg-cover bg-center bg-no-repeat transition-colors duration-300"
        style={{
          backgroundImage: "url('/download.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 transition-colors duration-300"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 transition-colors duration-300">
                Custom Healthcare Development Solutions
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 md:mb-8 transition-colors duration-300">
                Streamline healthcare operations with our compliant digital
                solutions designed to enhance patient care and operational
                efficiency.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
                <button
                  onClick={handleDashboardRedirect}
                  className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors inline-block text-center font-medium"
                >
                  {user ? "View Dashboard" : "View Dashboard"}
                </button>
                <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                  Contact Us
                </button>
              </div>
            </div>
            <div className="flex justify-center mt-8 lg:mt-0">
              <Limage />
            </div>
          </div>
        </div>
      </section>

      {/* services. */}
      <section
        id="services"
        className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Our Healthcare Services.
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
              We provide custom healthcare development services focusing on
              creating solutions that streamline different parts of healthcare
              institutions' operations while ensuring compliance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/20 transition-all duration-300 border border-transparent hover:border-purple-100 dark:hover:border-purple-800"
              >
                <div className="text-purple-600 dark:text-purple-400 mb-4 transition-colors duration-300">
                  {service.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base transition-colors duration-300">
                  {service.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0 transition-colors duration-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button className="flex items-center space-x-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium group transition-colors duration-300">
                  <span>Learn more</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* benefits. */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Benefits of Our Healthcare Services
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
              Our healthcare development services are designed to deliver
              tangible benefits to healthcare institutions and patients alike.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="text-center p-4 md:p-6 rounded-lg hover:shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/20 transition-all duration-300 border border-transparent hover:border-purple-100 dark:hover:border-purple-800 hover:bg-purple-50/30 dark:hover:bg-purple-900/10"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors duration-300">
                  <div className="text-purple-600 dark:text-purple-400 transition-colors duration-300">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {serviceDetails.map((detail, index) => (
        <section
          key={detail.id}
          className={`py-16 md:py-20 ${
            index % 2 === 0
              ? "bg-gray-50 dark:bg-gray-900"
              : "bg-white dark:bg-gray-800"
          } transition-colors duration-300`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`grid lg:grid-cols-2 gap-8 md:gap-12 items-center ${
                detail.imagePosition === "left" ? "lg:grid-flow-col-dense" : ""
              }`}
            >
              <div
                className={
                  detail.imagePosition === "left" ? "lg:col-start-2" : ""
                }
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  {detail.title}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 md:mb-8 transition-colors duration-300">
                  {detail.description}
                </p>
                <div className="space-y-4 md:space-y-6">
                  {detail.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center transition-colors duration-300">
                        <div className="text-purple-600 dark:text-purple-400 transition-colors duration-300">
                          {feature.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base transition-colors duration-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={`flex justify-center ${
                  detail.imagePosition === "left" ? "lg:col-start-1" : ""
                } mt-8 lg:mt-0`}
              >
                <Image2
                  imageSrc={
                    detail.id === "appointment-detail"
                      ? "/This%20is%20life.jpg"
                      : detail.id === "pharmacy-detail"
                      ? "/Remedios.jpg"
                      : "/Purple%20robot.jpg"
                  }
                  altText={
                    detail.id === "appointment-detail"
                      ? "Doctor Appointment Service"
                      : detail.id === "pharmacy-detail"
                      ? "Pharmacy App Development"
                      : "Healthcare Service"
                  }
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      <ChatBubble />
      <Footer />
    </div>
  );
};

export const Route = createFileRoute("/")({
  component: HealthcareLanding,
});
