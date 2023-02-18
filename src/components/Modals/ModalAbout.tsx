import { RiGithubFill } from 'react-icons/ri';
import BaseModal, { ModalProps } from './BaseModal';

const ModalAbout = (props: ModalProps) => {
  return (
    <BaseModal title="About" {...props}>
      <div className="p-4">
        <h3 className="text-lg font-bold">Worship App</h3>
        <p className="mt-2">
          Worship App is a web-based application designed to enhance the worship
          experience for churches by providing an easy way to display lyrics
          during services.
        </p>

        <div className="mt-6 flex">
          <a
            className="flex items-center gap-3 bg-zinc-700 px-3 py-2 hover:bg-zinc-600"
            href="https://github.com/roymandev/worship-app"
            target="_blank"
            rel="noreferrer"
          >
            <RiGithubFill className="h-5 w-5" />
            Repository
          </a>
        </div>
      </div>
    </BaseModal>
  );
};

export default ModalAbout;
