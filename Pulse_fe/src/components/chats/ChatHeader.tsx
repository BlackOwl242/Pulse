"use client";
import ChatHeaderTitle from "./ChatHeaderTitle";

interface ChatHeaderProps {
  search: string;
  setSearch: (s: string) => void;
  onOpenCreateGroup?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ search, setSearch, onOpenCreateGroup }) => {
  return (
    <div className="sticky px-4 pt-4 pb-4 sm:px-5 sm:pt-5 xl:pb-0 shrink-0 border-b xl:border-none border-gray-200 dark:border-gray-800">
      <ChatHeaderTitle onOpenCreateGroup={onOpenCreateGroup} />
      <div className="flex items-center gap-3 mt-4 xl:mt-2">
        <div className="relative w-full mb-2 xl:my-2">
          <form>
            <button className="absolute -translate-y-1/2 left-4 top-1/2">
              <svg
                className="fill-gray-500 dark:fill-gray-400"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z"
                  fill=""
                />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-3.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
