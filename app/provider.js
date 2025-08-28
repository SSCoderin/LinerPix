"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import Loading from "./components/Loading";

const Provider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    console.log("this is a user is caaling now", user);
    if (user) {
      CheckIsNewUser();
    } else {
      setLoading(false);
    }
  }, [user]);

  const CheckIsNewUser = async () => {
    try {
      console.log(
        "this is a user",
        user.id,
        user?.fullName,
        user?.emailAddresses[0]?.emailAddress
      );
      const resp = await axios.post(
        "/api/create-user",
        {
          userid: user?.id,
          username: user?.fullName,
          useremail: user?.emailAddresses[0]?.emailAddress,
        },
        {
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );
      console.log("this is a resp", resp.data);
      if (resp.data.calibrated === true) {
        window.location.href = "/content/calibration";
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return <div>{loading ? <Loading /> : children}</div>;
};

export default Provider;
