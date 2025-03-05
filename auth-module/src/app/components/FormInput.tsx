//src/app/components/FormInput.tsx
import { Input, Form } from "antd";

interface FormInputProps {
  label: string;
  type: string;
  placeholder: string;
}

const FormInput = ({ label, type, placeholder }: FormInputProps) => {
  return (
    <Form.Item name={label.toLowerCase()} noStyle>
      <div className="mb-4">
        <label className="block text-pink-600 font-semibold">{label}</label>
        <Input
          type={type}
          placeholder={placeholder}
          className="w-full p-3 mt-1 rounded-lg border-gray-300 focus:border-pink-500 focus:ring focus:ring-pink-200"
        />
      </div>
    </Form.Item>
  );
};

export default FormInput;
