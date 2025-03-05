//src/app/auth/register/page.tsx

"use client";
import { useState, useEffect } from "react";
import { Form, Button, message } from "antd";
import FormInput from "../../components/FormInput";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const Register = () => {
    const [form] = Form.useForm();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(true);
    const [animationDirection, setAnimationDirection] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationDirection((prev) => (prev === 1 ? -1 : 1));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleAuth = async (values: any) => {
        setLoading(true);
        console.log("handleAuth triggered with values:", values);
    
        try {
            const endpoint = isRegister ? "register/" : "login";
            const response = await fetch(`http://localhost:8000/${endpoint}`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json" 
                },
                body: JSON.stringify(values),
            });
    
            const data = await response.json();
            console.log("API Response:", data);
    
            if (!response.ok) {
                throw new Error(data.detail || "Authentication failed!");
            }
    
            if (isRegister) {
                if (data?.name && data?.email && data?.is_authenticated !== undefined) {
                    // Store registration details and token in localStorage
                    localStorage.setItem("token", data.token);  // Store token
                    localStorage.setItem("user", JSON.stringify({
                        name: data.name, 
                        email: data.email, 
                        is_authenticated: data.is_authenticated  // Correctly store is_authenticated
                    }));
    
                    message.success(data.message || "Registration successful! Please login.");
                    form.resetFields();
                    setIsRegister(false);
                } else {
                    console.error("Missing required fields in registration response", data);
                    message.error("Registration failed due to incomplete response.");
                }
            } else {
                if (data.user?.token && data.user?.name && data.user?.email) {
                    localStorage.setItem("token", data.user.token);
                    localStorage.setItem("user", JSON.stringify({
                        name: data.user.name,
                        email: data.user.email,
                        is_authenticated: data.user.is_authenticated, // Ensure this is correctly stored
                    }));
                    message.success(data.message || "Login successful!");
                    router.push("/dashboard");
                } else {
                    console.error("Missing required fields in API response", data);
                    message.error("Login failed due to incomplete response.");
                }
                
            }
        } catch (error: any) {
            message.error(error.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };
    
     
    const toggleAuthMode = () => {
        setIsRegister(!isRegister);
        form.resetFields();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-pink-200 to-purple-200">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white shadow-2xl rounded-lg p-8 max-w-4xl w-full flex relative overflow-hidden"
            >
                <div className="w-1/2 hidden md:flex flex-col items-center justify-center relative bg-pink-100 p-6 rounded-lg shadow-lg">
                    <motion.div
                        animate={{ x: animationDirection * 10, opacity: 1 }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                        className="absolute top-10 left-10 shadow-2xl shadow-gray-500 rounded-xl transform scale-105"
                    >
                        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}>
                            <p className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-lg font-semibold text-white bg-black px-2 py-1 rounded-lg">Let's</p>
                        </motion.div>
                        <Image src="/logo1.png" alt="Register Image 1" width={200} height={200} className="rounded-lg shadow-lg bg-gray-300" />
                    </motion.div>

                    <motion.div
                        animate={{ x: -animationDirection * 10, opacity: 1 }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                        className="absolute bottom-10 right-10 shadow-2xl shadow-gray-500 rounded-xl transform scale-105"
                    >
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}>
                            <p className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-lg font-semibold text-white bg-black px-2 py-1 rounded-lg">Begin</p>
                        </motion.div>
                        <Image src="/logo2.png" alt="Register Image 2" width={200} height={200} className="rounded-lg shadow-lg bg-gray-300" />
                    </motion.div>
                </div>

                <div className="w-full md:w-1/2 px-6">
                    <h2 className="text-4xl font-bold text-pink-600 mb-6 text-center">
                        {isRegister ? "Sign Up" : "Login"}
                    </h2>
                    
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleAuth}
                        validateTrigger="onBlur"
                    >
                        {isRegister && (
                            <Form.Item
                                name="name"
                                rules={[{ required: true, message: "Please enter your name!" }]}
                            >
                                <FormInput label="Name" type="text" placeholder="Enter your name" />
                            </Form.Item>
                        )}

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: "Please enter your email!" },
                                { type: "email", message: "Enter a valid email!" }
                            ]}
                        >
                            <FormInput label="Email" type="email" placeholder="Enter your email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: "Please enter a password!" },
                                { min: 6, message: "Password must be at least 6 characters!" }
                            ]}
                        >
                            <FormInput label="Password" type="password" placeholder="Enter your password" />
                        </Form.Item>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold p-3 mt-4 rounded-lg"
                                loading={loading}
                            >
                                {isRegister ? "Sign Up" : "Login"}
                            </Button>
                        </motion.div>
                    </Form>

                    <p className="text-center text-gray-600 mt-4">
                        {isRegister ? "Already have an account? " : "Don't have an account? "}
                        <button onClick={toggleAuthMode} className="text-pink-500 hover:underline">
                            {isRegister ? "Login" : "Sign Up"}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
