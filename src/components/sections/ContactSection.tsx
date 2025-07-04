import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { sendContactEmail } from "../../api/emailService";
import toast from "react-hot-toast";

// Define form validation schema
const ContactFormSchema = Yup.object().shape({
  name: Yup.string().required("نام الزامی است"),
  phone: Yup.string()
    .matches(
      /^(\+98|0)?9\d{9}$/,
      "شماره موبایل نامعتبر است (فرمت صحیح: 09XXXXXXXXX)"
    )
    .required("شماره موبایل الزامی است"),
  subject: Yup.string().required("موضوع الزامی است"),
  message: Yup.string()
    .min(10, "پیام باید حداقل 10 کاراکتر باشد")
    .required("پیام الزامی است"),
});

// Form initial values
interface ContactFormValues {
  name: string;
  phone: string;
  subject: string;
  message: string;
}

// Email sending status
type FormStatus = "idle" | "submitting" | "success" | "error";

const ContactSection: React.FC = () => {
  // Form state management
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
          >
            تماس <span className="text-primary-500">با ما</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            سوالی دارید؟ تیم پشتیبانی ما آماده پاسخگویی و راهنمایی شما هستند
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              پیام خود را ارسال کنید
            </h3>

            <Formik
              initialValues={{
                name: "",
                phone: "",
                subject: "",
                message: "",
              }}
              validationSchema={ContactFormSchema}
              onSubmit={async (values: ContactFormValues, { resetForm }) => {
                try {
                  setFormStatus("submitting");

                  const result = await sendContactEmail(values);

                  if (result.success) {
                    setFormStatus("success");
                    setStatusMessage(result.message);
                    toast.success(result.message);
                    resetForm();

                    // Reset success message after 5 seconds
                    setTimeout(() => {
                      setFormStatus("idle");
                      setStatusMessage("");
                    }, 5000);
                  } else {
                    throw new Error(result.message);
                  }
                } catch (error) {
                  setFormStatus("error");
                  const errorMsg =
                    error instanceof Error
                      ? error.message
                      : "خطا در ارسال پیام";
                  setStatusMessage(errorMsg);
                  toast.error(errorMsg);
                }
              }}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="relative">
                  {/* Form status overlay for success/error */}
                  {formStatus === "success" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 rounded-xl z-10"
                    >
                      <CheckCircle className="text-green-500 mb-4" size={60} />
                      <h4 className="text-xl font-bold text-green-600">
                        با تشکر!
                      </h4>
                      <p className="text-gray-700">{statusMessage}</p>
                    </motion.div>
                  )}

                  {formStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 rounded-xl z-10"
                    >
                      <AlertCircle className="text-red-500 mb-4" size={60} />
                      <h4 className="text-xl font-bold text-red-600">
                        خطا در ارسال پیام
                      </h4>
                      <p className="text-gray-700">{statusMessage}</p>
                      <button
                        onClick={() => setFormStatus("idle")}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        تلاش مجدد
                      </button>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        نام و نام خانوادگی
                      </label>
                      <Field
                        type="text"
                        id="name"
                        name="name"
                        className={`w-full border ${
                          touched.name && errors.name
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg p-3 focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition-colors`}
                        placeholder="نام خود را وارد کنید"
                      />
                      <ErrorMessage
                        name="name"
                        component="p"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                    <div className="mb-6">
                      <label
                        htmlFor="phone"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        شماره موبایل
                      </label>
                      <Field
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full bg-gray-50 border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-md py-2 px-4 text-gray-700 leading-tight focus:outline-none transition duration-300"
                        placeholder="09123456789"
                        disabled={formStatus === "submitting"}
                      />
                      <ErrorMessage
                        name="phone"
                        component="p"
                        className="text-red-500 mt-1 text-sm"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      موضوع
                    </label>
                    <Field
                      type="text"
                      id="subject"
                      name="subject"
                      className={`w-full border ${
                        touched.subject && errors.subject
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg p-3 focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition-colors`}
                      placeholder="موضوع پیام"
                    />
                    <ErrorMessage
                      name="subject"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      پیام
                    </label>
                    <Field
                      as="textarea"
                      id="message"
                      name="message"
                      rows={5}
                      className={`w-full border ${
                        touched.message && errors.message
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg p-3 focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition-colors resize-none`}
                      placeholder="پیام خود را بنویسید..."
                    />
                    <ErrorMessage
                      name="message"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || formStatus === "submitting"}
                    className={`btn btn-primary w-full py-3 flex items-center justify-center ${
                      isSubmitting || formStatus === "submitting"
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmitting || formStatus === "submitting" ? (
                      <>
                        <Loader className="animate-spin ml-2" size={20} />
                        در حال ارسال...
                      </>
                    ) : (
                      "ارسال پیام"
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-md p-8 h-full">
              <h3 className="text-2xl font-bold mb-8">اطلاعات تماس</h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="ml-4 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold mb-1">شماره تماس</h4>

                    <a href="tel:+9100711835">
                      <p className="opacity-90">۰۹۱۰۰۷۱۱۸۳۵</p>
                    </a>
                    <a href="tel:+9108680274">
                      <p className="opacity-90">۰۹۱۰۸۶۸۰۲۷۴</p>
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="ml-4 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold mb-1">ایمیل</h4>
                    <a href="mailto:contact@moojpayam.ir">
                      <p className="opacity-90">contact@moojpayam.ir</p>
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="ml-4 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold mb-1">آدرس</h4>
                    <p className="opacity-90">کرج طالقانی جنوبی</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h4 className="font-bold mb-4">ساعات کاری</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-white opacity-90">شنبه تا چهارشنبه:</div>
                  <div className="text-white">۸ صبح تا ۶ عصر</div>
                  <div className="text-white opacity-90">پنج‌شنبه:</div>
                  <div className="text-white">۸ صبح تا ۱ بعدازظهر</div>
                  <div className="text-white opacity-90">جمعه:</div>
                  <div className="text-white">تعطیل</div>
                </div>
              </div>

              <div className="mt-10 flex items-center">
                <MessageSquare className="ml-2" size={20} />
                <p className="opacity-90">
                  پشتیبانی آنلاین: ۲۴ ساعته، ۷ روز هفته
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
