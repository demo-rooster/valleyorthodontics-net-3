const router = [
  {
    name: 'Home',
    path: '/',
    navigation: false,
    mobile: true
  },
  {
    name: 'About',
    path: '/about',
    navigation: true,
    children: [
      {
        name: 'Meet Dr. Rocha',
        path: '/meet-dr-rocha'
      },
      {
        name: 'Meet The Team',
        path: '/meet-the-team'
      },
      {
        name: 'Tour The Office',
        path: '/tour-the-office'
      },
      {
        name: 'What Sets Us Apart',
        path: '/what-sets-us-apart'
      },
      {
        name: 'Supporting Our Local Community',
        path: '/supporting-our-local-community'
      }
    ]
  },
  {
    name: 'Treatments',
    path: '/about-orthodontics',
    navigation: true,
    children: [
      // {
      //   name: 'Braces for Children',
      //   path: '/for-children'
      // },
      // {
      //   name: 'Braces for Teens',
      //   path: '/for-teens'
      // },
      // {
      //   name: 'Braces for Adults',
      //   path: '/for-adults'
      // },
      {
        name: 'Treatments For All Ages',
        path: '/all-ages-treatments'
      },
      {
        name: 'Clear Aligners',
        path: '/clear-aligners'
      },
      {
        name: 'Braces',
        path: '/braces'
      },
      {
        name: 'Ceramic Braces',
        path: '/ceramic-braces'
      },
      {
        name: 'Iconix Braces',
        path: '/iconix-champagne-gold-braces'
      }
    ]
  },
  {
    name: 'Resources',
    path: '/for-new-patients',
    navigation: true,
    children: [
      {
        name: 'New Patients',
        path: '/for-new-patients'
      },
      {
        name: 'Why Choose Us',
        path: '/why-choose-us'
      },
      {
        name: 'Financial Information',
        path: '/financial-information'
      },
      {
        name: 'Patient Forms',
        path: '/patient-forms'
      },
      {
        name: 'Privacy Policy',
        path: '/privacypolicy'
      },
      {
        name: 'Braces First Aid',
        path: '/braces-first-aid'
      },
      // {
      //   name: 'What To Expect',
      //   path: '/what-to-expect-on-the-first-day-of-braces'
      // },
      {
        name: 'Instructional Videos',
        path: '/instructional-videos'
      },
      {
        name: 'Recommended Products',
        path: '/orthodontic-products-we-recommend'
      },
      {
        name: 'Frequently Asked Questions',
        path: '/faq'
      },
      {
        name: 'Patient Referral Form',
        path: '/doctor-referals-slips'
      }
    ]
  },
  {
    name: 'Join Our Team',
    path: '/join-our-team',
    navigation: true
  },
  {
    name: 'Contact Us',
    path: '/contact',
    navigation: true
  }
]

export default router
