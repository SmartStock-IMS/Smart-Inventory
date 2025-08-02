import { SearchIcon } from "lucide-react";
import Logo from "@assets/images/dashboard/genaral/logo.png";

const Header = () => {
  return (
    <nav className="h-full w-full p-3 flex flex-row justify-between bg-white">
      {/* header: logo */}
      <div>
        <img src={Logo} alt="Rollious Cosmetics" className="h-full w-full" />
      </div>
      {/* header: search-bar */}
      <div className="w-1/2 px-4 flex flex-row items-center gap-x-2 rounded-lg bg-gray-200">
        <div className="flex flex-grow flex-row items-center gap-x-3">
          <SearchIcon className="h-6 w-6 text-gray-600" />
          <input
            type="text"
            placeholder="Search or type a command"
            className="w-full bg-transparent focus:outline-none"
          />
        </div>
        <div className="ps-3 border-s border-gray-400">
          <button className="rounded-lg text-gray-600 font-semibold cursor-pointer">
            Search
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
