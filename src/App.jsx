import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

function App({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  function closeModal() {
    setIsOpen(false);
  }

  const appTitle = self.pidget.language.getI18n({
    key: 'app.title',
    i18n: self.pentos.hcmintegrationlog.config.pidgetTranslation,
  });

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          id="pidgetDialog"
          as="div"
          className="relative z-10 bg-slate-500"
          onClose={closeModal}
        >
          {/* Transition.Child to apply one transition to the backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              {/* Another Transition.Child to apply a separate transition to the contents */}
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full h-full transform overflow-hidden rounded-lg bg-white p-0 text-left align-middle shadow-xl transition-all">
                  <div className="flex bg-slate-300 h-14 p-2">
                    <img
                      src={import.meta.env.VITE_PENTOS_LOGO_ICON}
                      alt="Pentos"
                      className="h-10"
                    />
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 p-2 pl-3"
                    >
                      {appTitle}
                    </Dialog.Title>
                  </div>
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default App;
