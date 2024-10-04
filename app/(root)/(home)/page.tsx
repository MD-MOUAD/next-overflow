import { useTheme } from "@/context/ThemeProvider";
import { UserButton } from "@clerk/nextjs";

const Home = () => {
  const { mode } = useTheme();
  return (
    <div>
      <UserButton />
      {mode.length}
    </div>
  );
};
export default Home;
