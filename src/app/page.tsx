'use client';

import Link from "next/link";
import { BookOpen, Users, Award, ArrowRight, GraduationCap, Star, TrendingUp, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header/Navigation */}
      <header className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">CAP LMS</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Presidency University</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Contact
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Academic
              <span className="text-blue-600 block">Platform</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Transform your learning experience with our state-of-the-art Learning Management System 
              designed specifically for Presidency University students and faculty.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              Start Learning Today
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="#features"
              className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Explore Features
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600 dark:text-gray-400">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">Faculty Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1,200+</div>
              <div className="text-gray-600 dark:text-gray-400">Courses</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Academic Excellence
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our comprehensive platform brings together all the tools and resources you need for effective learning and teaching.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Course Management</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Create, organize, and deliver engaging course content with our intuitive course builder.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <h4 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Collaboration</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with peers and instructors through discussion forums and group projects.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <Award className="h-12 w-12 text-yellow-600 mb-4" />
              <h4 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Assessment</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Take quizzes, submit assignments, and track your academic progress in real-time.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <TrendingUp className="h-12 w-12 text-purple-600 mb-4" />
              <h4 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Analytics</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Get detailed insights into your learning progress and performance metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Empowering Education at Presidency University
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                CAP LMS is specifically designed to meet the unique needs of Presidency University's diverse academic community. 
                Our platform seamlessly integrates with university systems to provide a unified learning experience.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">24/7 Technical Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">Mobile-First Design</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">Secure & Reliable</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">Regular Updates & Improvements</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl">
              <div className="text-center">
                <Calendar className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Academic Year 2024-25</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Join thousands of students and faculty members who are already experiencing the future of education.
                </p>
                <Link 
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Join Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-8 w-8 text-blue-400" />
                <div>
                  <h5 className="text-xl font-bold">CAP LMS</h5>
                  <p className="text-sm text-gray-400">Presidency University</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Transforming education through innovative technology and comprehensive learning solutions 
                for the academic community of Presidency University.
              </p>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">Quick Links</h6>
              <div className="space-y-2">
                <Link href="/login" className="block text-gray-400 hover:text-white transition-colors">
                  Student Login
                </Link>
                <Link href="/login" className="block text-gray-400 hover:text-white transition-colors">
                  Faculty Login
                </Link>
                <Link href="#features" className="block text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#about" className="block text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </div>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">Contact Info</h6>
              <div className="space-y-2 text-gray-400">
                <p>Presidency University</p>
                <p>Bengaluru, Karnataka</p>
                <p>support@presidencyuniversity.in</p>
                <p>+91 80 4092 6666</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CAP LMS - Presidency University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
