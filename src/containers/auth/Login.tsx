import {
  Button,
  Form,
  FormControl,
  FormField,
  Input,
  Separator,
} from "@/components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

const Login = () => {
  const token = localStorage.getItem("token");  
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    reValidateMode: "onSubmit",
  });

  const onSubmit = (values: LoginSchemaType) => {
    if (values.email !== "admin@at-peak.com" || values.password !== "v2v2024") {
      toast({
        className:
          "fixed w-[300px] md:w-[400px] py-2 bg-red-400 border-red-500 top-4 right-4 text-white",
        title: "Fail to login",
        description: "Wrong credentials",
        duration: 3000,
      });
      return;
    }

    localStorage.setItem("token", uuidv4());
    navigate("/conversation");
  };

  if (token) return <Navigate to="/conversation" />;

  return (
    // login container
    <div className="relative h-dvh w-full bg-[#1A1A1A] px-10 py-20 text-center text-white sm:p-0">
      {/* login content */}
      <div className="flex h-full flex-col rounded-2xl border-2 border-[#6A6A6A] bg-[#343434b3] p-5 shadow-login sm:absolute sm:right-0 sm:w-[500px] sm:rounded-none">
        {/* login header */}
        <div className="mx-auto mt-5">
          <span className="text-lg font-bold md:hidden">
            {/* AtPeak logo */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#87a922"
              className="mr-2 inline"
            >
              <circle cx="6.5" cy="6.5" r="2.5"></circle>
              <path d="m14 7-5.223 8.487L7 13l-5 7h20z"></path>
            </svg>
            AtPeak
          </span>

          <h2 className="my-5 text-4xl font-bold sm:text-5xl">V2Vへようこそ</h2>
        </div>

        {/* login form */}
        <Form {...form}>
          <form
            className="mx-auto my-0 mt-10 flex w-[260px] max-w-[260px] flex-col gap-4 md:mt-20"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormControl>
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="メールアドレス"
                  />
                </FormControl>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormControl>
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="パスワード"
                    type="password"
                  />
                </FormControl>
              )}
            />

            <Button
              className="w-full bg-neutral-200 text-black hover:bg-white"
              type="submit"
              disabled={!form.formState.isValid}
            >
              ログイン
            </Button>
          </form>

          {/* login networks */}
          <div className="my-6">
            <p className="text-xs">
              アカウントをお持ちでないですか？
              <span className="text-sm"> 登録する</span>
            </p>

            <Separator className="my-4 bg-neutral-500" />

            {/* outlook  */}
            <div className="mx-auto flex w-[260px] rounded-lg border border-[#6A6A6A] px-4 py-2 hover:border-white">
              {/* outlook logo */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#fff"
              >
                <path d="M11.55 21H3v-8.55h8.55V21zM21 21h-8.55v-8.55H21V21zm-9.45-9.45H3V3h8.55v8.55zm9.45 0h-8.55V3H21v8.55z"></path>
              </svg>

              <span className="ml-2">Outlookでログイン</span>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
