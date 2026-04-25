import FormBuilder from "./formbuilder";
import ProfileCard from "./profile-card";
import React from "react";

const ViewDetails = () => {
  return (
    <div>
      <ProfileCard />
      <FormBuilder filled={false} from={"profile"} type={"checkIn"} />
    </div>
  );
};

export default ViewDetails;
