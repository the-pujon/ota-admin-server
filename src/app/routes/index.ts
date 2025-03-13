import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { VisaRoutes } from '../modules/Visa/visa.route';
import { SSLPaymentRoutes } from '../modules/SSLPayment/ssl.route';
import { travelRoutes } from '../modules/VisaBooking/vb.route';
import { packageRoutes } from '../modules/Package/package.route';
import { PackageSSLPaymentRoutes } from '../modules/PackageSSLPayment/ssl.route';
import { VisaRoutesV2 } from '../modules/Visa.v2/visa.routes';


const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path:'/visa',
    route:VisaRoutes,
  },
  {
    path:'/ssl',
    route:SSLPaymentRoutes,

  },

	{	path: '/traveler/',
		route: travelRoutes,
	},

	{	path: '/package/',
		route: packageRoutes,
	},
	{	path: '/sslPackagePayment/',
		route: PackageSSLPaymentRoutes,
	},
  {
    path: "/visa/v2",
    route: VisaRoutesV2,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
