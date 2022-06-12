import BaseButton from '../BaseButton';

const ContextMenuPlaylistItem = () => {
  return (
    <>
      <BaseButton variant="primary" className="py-1 text-left px-3">
        Go Live
      </BaseButton>
      <hr />
      <BaseButton variant="default" className="py-1 text-left px-3">
        Edit
      </BaseButton>
      <BaseButton variant="default" className="py-1 text-left px-3">
        Remove
      </BaseButton>
      <hr />
      <BaseButton variant="red" className="py-1 text-left px-3">
        Add Item
      </BaseButton>
    </>
  );
};

export default ContextMenuPlaylistItem;
