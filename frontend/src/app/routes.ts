import { createBrowserRouter, Navigate } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { SurveyProjects } from "./pages/SurveyProjects";
import { Properties } from "./pages/Properties";
import { PropertyListings } from "./pages/PropertyListings";
import { Customers } from "./pages/Customers";
import { Transactions } from "./pages/Transactions";
import { Reports } from "./pages/Reports";
import { LandTitles } from "./pages/LandTitles";
import { LandingPage } from "./pages/LandingPage";
import { CustomerPortal } from "./pages/CustomerPortal";
import { Users } from "./pages/Users";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/portal",
    Component: CustomerPortal,
  },
  {
    path: "/dashboard",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "survey-projects", Component: SurveyProjects },
      { path: "land-titles", Component: LandTitles },
      { path: "properties", Component: Properties },
      { path: "property-listings", Component: PropertyListings },
      { path: "customers", Component: Customers },
      { path: "transactions", Component: Transactions },
      { path: "reports", Component: Reports },
      { path: "users", Component: Users },
    ],
  },
]);
