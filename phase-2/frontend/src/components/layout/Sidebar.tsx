'use client'

import Link from 'next/link'
import { Sidebar as FlowbiteSidebar } from 'flowbite-react'
import { LayoutDashboard, PlusCircle, Calendar, Tag as TagIcon, Settings } from 'lucide-react'

export default function Sidebar() {
  const navItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      href: '/dashboard'
    },
    {
      icon: <PlusCircle className="w-5 h-5" />,
      label: 'All Tasks',
      href: '/dashboard?view=all'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Calendar',
      href: '/dashboard?view=calendar'
    },
    {
      icon: <TagIcon className="w-5 h-5" />,
      label: 'Tags',
      href: '/dashboard?view=tags'
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      href: '/settings'
    }
  ]

  return (
    <FlowbiteSidebar theme="custom">
      <FlowbiteSidebar.Items>
        <FlowbiteSidebar.CTA>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Productivity
          </span>
        </FlowbiteSidebar.CTA>
        <div className="space-y-2">
          {navItems.map((item, index) => (
            <FlowbiteSidebar.Item
              key={index}
              as={Link}
              href={item.href}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              icon={item.icon}
            >
              {item.label}
            </FlowbiteSidebar.Item>
          ))}
        </div>
      </FlowbiteSidebar.Items>
    </FlowbiteSidebar>
  )
}
