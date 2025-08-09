import Link from "next/link";
import Image from "next/image";
import Icon from '@mui/material/Icon';

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin"],
      },
      
      {
        icon: "/upload.png",
        label: "Image Analysis",
        href: "/image-processing",
        visible: ["admin"],
      },      
    ],
  },
];



const Menu = () => {
  return (
    <div className='mt-4 text-sm'>
      {menuItems.map(i => (
        <div  className="flex flex-col gap-2 mt-10" key={i.title}>
          <span className="hidden lg:block text-grey-400 font-semibold my-4">{i.title}</span>
          {i.items.map(item => (
          <Link 
          href={item.href} 
          key={item.label}
          className="flex items-center justify-center lg:justify-start gap-4 py-2 px-4  font-medium text-black bg-green-200 h-min-20 rounded-lg hover:bg-green-900 hover:text-white"
          >
              <Image className=" size-10 bg-orange-200 border-2 border-red-950 rounded-lg p-2" src={item.icon} alt={item.label} width={24} height={24}/>
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          ))}
        </div>
        ))}
        </div>
  )
}

export default Menu
