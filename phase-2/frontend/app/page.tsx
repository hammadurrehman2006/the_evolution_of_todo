'use client'

import Link from 'next/link'
import { Button } from 'flowbite-react'
import { ArrowRight, CheckCircle, Zap, Shield, BarChart } from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: <CheckCircle className="w-12 h-12 text-blue-600" />,
      title: 'Task Management',
      description: 'Create, organize, and complete tasks with intelligent prioritization'
    },
    {
      icon: <Zap className="w-12 h-12 text-blue-600" />,
      title: 'Smart Reminders',
      description: 'Never miss a deadline with automated notifications'
    },
    {
      icon: <Shield className="w-12 h-12 text-blue-600" />,
      title: 'Secure Storage',
      description: 'Your data stays safe with advanced encryption'
    },
    {
      icon: <BarChart className="w-12 h-12 text-blue-600" />,
      title: 'Analytics',
      description: 'Track your productivity with detailed insights'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6 text-5xl md:text-7xl font-bold text-white">
              Master Your Productivity
            </h1>

            <p className="mb-8 text-xl md:text-2xl text-blue-100">
              A professional task management solution designed for efficiency and clarity.
            </p>

            <div>
              <Link href="/dashboard">
                <Button
                  size="xl"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold text-lg px-8 py-4"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white opacity-5 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="mb-16 text-center text-4xl font-bold text-gray-900 dark:text-white">
            Everything You Need
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4 flex items-start gap-4">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <div
            className="rounded-2xl bg-white dark:bg-gray-900 p-12 shadow-xl"
          >
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
              Join thousands of professionals who have transformed their productivity.
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4"
              >
                Start Managing Tasks Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
