import { Dialog, Transition, Menu } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth.context";

const CustomModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, login, register, logout } = useAuth();

  const closeModal = () => { setIsOpen(false); setError(''); setForm({ email: '', password: '', name: '' }); };
  const openModal = () => {
    if (!user) setIsOpen(true);
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ email: form.email, password: form.password, name: form.name });
      }
      closeModal();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      {user ? (
        <Menu as="div" className="relative inline-block text-left relative z-50">
          <Menu.Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-sm rounded font-medium transition cursor-pointer">
            Hi, {user.name?.split(' ')[0] || user.email}
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-4 py-3">
                <p className="text-sm text-gray-900">Signed in as</p>
                <p className="truncate text-sm font-bold text-gray-900">{user.name}</p>
                <p className="truncate text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/bookings')}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                    >
                      My Bookings
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className={`${
                        active ? 'bg-red-50 text-red-700' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      ) : (
        <button
          onClick={openModal}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-sm rounded font-medium transition"
        >
          Sign In
        </button>
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={closeModal}>
          <div className="min-h-screen flex items-center justify-center px-4">
            <Transition.Child as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
              leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            </Transition.Child>

            <Transition.Child as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>

                <div className="flex justify-center mb-4">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">S</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-1">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-center text-gray-500 text-sm mb-6">
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                    className="text-red-600 hover:underline font-medium"
                  >
                    {mode === 'login' ? 'Register' : 'Sign In'}
                  </button>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        name="name" type="text" required value={form.name} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      name="email" type="email" required value={form.email} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      name="password" type="password" required value={form.password} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="Min 6 characters"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-full font-semibold transition disabled:opacity-50 mt-2"
                  >
                    {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <p className="text-center text-gray-400 text-xs mt-6">
                  By continuing, you agree to ShowsNow's Terms &amp; Privacy Policy.
                </p>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default CustomModal;
