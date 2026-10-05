import type { Metadata } from "next";
import { AdminInteriorChrome } from "../../components/AdminInteriorChrome";
import "./admin-enhancements.css";

export const metadata:Metadata={
  robots:{
    index:false,
    follow:false,
    nocache:true,
    googleBot:{
      index:false,
      follow:false,
      noimageindex:true
    }
  }
};

export default function AdminLayout({children}:{children:React.ReactNode}){
  return <AdminInteriorChrome>{children}</AdminInteriorChrome>;
}
