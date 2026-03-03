import { Routes, Route, Navigate } from "react-router-dom";
import RegistrationForm from "./components/registration-form";
import LoginForm from "./components/login-form";
import { TabSelectorView } from "./pages";
import HomePage from "./components/home-page";
import ProfilePage from "./components/profile-page";
import ChatPage from "./pages/ChatPage";

const siteTabs = [
  { name: "Home", redirect: "home", Component: HomePage },
  { name: "Profile", redirect: "profile", Component: ProfilePage },
  { name: "Chat", redirect: "chat", Component: ChatPage },
];

function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/login" element={<LoginForm />} />
      {siteTabs.map(({redirect, Component}, index) => (
        <Route key={redirect} path={redirect} element={<TabSelectorView Component={Component} index={index} siteTabs={siteTabs} />} />
      ))}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
