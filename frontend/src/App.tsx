import { Routes, Route, Navigate } from "react-router-dom";
import RegistrationForm from "./components/registration-form";
import LoginForm from "./components/login-form";
import { TabSelectorView } from "./pages";
import HomePage from "./components/home-page";
import CreatePost from "./components/create-post";
import ProfilePage from "./components/profile-page";
import UserProfilePage from "./pages/user-profile-page";
import ChatPage from "./pages/ChatPage";

const siteTabs = [
  { name: "Home", redirect: "home", Component: HomePage },
  { name: "Create Post", redirect: "create-post", Component: CreatePost },
  { name: "Profile", redirect: "profile", Component: ProfilePage },
];

function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/login" element={<LoginForm />} />
      {siteTabs.map(({redirect, Component}, index) => (
        <Route key={redirect} path={redirect} element={<TabSelectorView Component={Component} index={index} siteTabs={siteTabs} />} />
      ))}
      <Route path="/user/:userId" element={<TabSelectorView Component={UserProfilePage} index={-1} siteTabs={siteTabs} />} />
      <Route path="/chat/:userId" element={<TabSelectorView Component={ChatPage} index={-1} siteTabs={siteTabs} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
