import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const OkrAdminSideBar = () => {
  const pathname = usePathname();
  return (
    <>
      <Link href="/setting/admin" passHref>
        <Button
          className={`bg-white w-full text-black rounded-lg py-2 justify-start hover:bg-secondary-100 hover:text-primary-400`}
        >
          <Image
            src={"/settings/manage.png"}
            width={16}
            height={16}
            alt="Manage"
            className="w-4"
          />
          Manage Organization
        </Button>
      </Link>
      <Link href="/setting/admin/users" passHref>
        <Button
          className={`bg-white w-full text-black rounded-lg mt-2 py-2 justify-start hover:bg-secondary-100 hover:text-primary-400`}
        >
          <Image
            src={"/settings/users.png"}
            width={16}
            height={16}
            alt="users"
            className="w-4 mr-2"
          />
          Users Management
        </Button>
      </Link>
      <Button
        className={`bg-white w-full text-black rounded-lg mt-2 py-2 justify-start hover:bg-secondary-100 hover:text-primary-400`}
      >
        <Image
          src={"/settings/notifications.png"}
          alt="notification"
          width={16}
          height={16}
          className="w-4"
        />
        Notifications
      </Button>
      <Button
        className={`bg-white w-full text-black rounded-lg mt-2 py-2 justify-start hover:bg-secondary-100 hover:text-primary-400`}
      >
        <Image
          src={"/settings/person.png"}
          width={16}
          height={16}
          alt="person"
          className="w-4"
        />{" "}
        Manage Account
      </Button>
    </>
  );
};

export default OkrAdminSideBar;
