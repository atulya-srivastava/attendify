import React from "react";
import InputForm from "../../../components/input-form";
import { useUserContext } from "../../../providers/UserProvider";
import { useNavigate } from "react-router-dom";
import { useInputForm } from "../../../providers/InputFormProvider";
import { databases } from "../../../appwrite/config";
import { Query } from "appwrite";
import { loginWithPasskey } from "../../../utils/webauthn";

const LoginForm = () => {
  const [category, setCategory] = React.useState("STUDENT");

  const { login } = useUserContext();
  const { formData, setFormData } = useInputForm();

  const navigate = useNavigate();

  const loginOrg = async () => {
    try {
      const validUser = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DB_ID,
        import.meta.env.VITE_APPWRITE_ORG_COLLECTION_ID,
        [Query.equal("email", [formData.email])]
      );

      if (validUser.total === 0) {
        alert("Invalid user, please check your email");
        return;
      }

      if (validUser.documents[0].passKey) {
        const webauthnRes = await loginWithPasskey(
          validUser.documents[0],
          "ORG"
        );
        if (!webauthnRes) {
          alert("Verification Failed");
          return;
        }
      }

      console.log("Logging in...");
      await login(formData.email, formData.password);
      navigate(`/admin/dashboard/${validUser.documents[0].$id}`, {
        replace: true,
      });
      console.log("Login successfull");
    } catch (error) {
      console.log(error);
    } finally {
      setFormData({
        name: "",
        mobileNumber: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        orgCode: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
      });
    }
  };

  const loginStudent = async () => {
    try {
      const validUser = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DB_ID,
        import.meta.env.VITE_APPWRITE_STD_COLLECTION_ID,
        [Query.equal("email", [formData.email])]
      );

      if (validUser.total === 0) {
        alert("Invalid user, please check your email");
        return;
      }

      console.log("Logging in...");
      await login(formData.email, formData.password);
      navigate(`/dashboard/${validUser.documents[0].$id}`, { replace: true });
      console.log("Login successfull");
    } catch (error) {
      console.log(error);
    } finally {
      setFormData({
        name: "",
        mobileNumber: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        orgCode: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
      });
    }
  };

  return (
    <>
      <div className="flex justify-center items-center my-2 gap-2 font-garamond text-textPrimary">
        <button
          className={`${
            category === "STUDENT"
              ? "bg-accent p-2 rounded"
              : "p-2 border-b-2 border-b-accent"
          }`}
          onClick={() => setCategory("STUDENT")}
        >
          Student
        </button>
        <button
          className={`${
            category === "ORG"
              ? "bg-accent p-2 rounded"
              : "p-2 border-b-2 border-b-accent"
          }`}
          onClick={() => setCategory("ORG")}
        >
          Organisation
        </button>
      </div>
      <div>
        {category === "ORG" && (
          <InputForm
            category={category}
            type={"LOGIN"}
            formHandler={loginOrg}
          />
        )}
      </div>
      <div>
        {category === "STUDENT" && (
          <InputForm
            category={category}
            type={"LOGIN"}
            formHandler={loginStudent}
          />
        )}
      </div>
    </>
  );
};

export default LoginForm;
