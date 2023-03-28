import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { nanoid } from "nanoid";
import { toBlob } from "html-to-image";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Slider from 'rc-slider';
import "rc-slider/assets/index.css";

interface AddMotiveBarProps {
    displayCopy: boolean;
    onAddMotive: (s: string) => void;
    onCopyToClipboard: () => void;
    onClear: () => void;
}

function AddMotiveBar({displayCopy, onAddMotive, onCopyToClipboard, onClear}: AddMotiveBarProps) {
    const [name, setName] = useState("");
    
    function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
      setName(e.target.value);
    }
    
    function handleOnKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        addMotive();
      }
    }
    
    function addMotive() {
      const cleanedName = name.trim();
      if (cleanedName.length === 0) {
        return;
      }
      onAddMotive(cleanedName);
      setName("");
    }
  
    return (
      <div>
        <div className="form-row my-2">
            <input type="text" placeholder="e.g. Hunger, Fun, etc." className="col-10 form-control" value={name} onChange={handleOnChange} onKeyDown={handleOnKeyDown}></input>
        </div>
        <div className="form-row my-2">
          <button type="button" className="col btn btn-primary" disabled={name.trim().length === 0} onClick={addMotive}>Add</button>
        </div>
        <div className="form-row my-2">
          {displayCopy ? <button className="col btn btn-primary" onClick={onCopyToClipboard}>Copy</button> : null}
        </div>
        <div className="form-row my-2">
          {displayCopy ? <button className="col btn btn-danger" onClick={onClear}>Clear</button> : null}
        </div>
      </div>
    )
}
  
interface MotiveProps {
    name: string;
}

interface Motive {
    id: string;
    name: string;
}

function MotiveElement({name}: MotiveProps) {
    const [percent, setPercent] = useState(50);

  function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    setPercent(e.target.valueAsNumber);
  }

  return (
    <div className="mb-3">
      <label className="form-label align-self-center">{name}</label>
      <Slider defaultValue={50} />
    </div>
  );
}

export default function MotivesDashboard() {
  const [motives, setMotives] = useState<Array<Motive>>([]);
  const myRef = useRef(null);

  const renderedMotives = motives.map((motive: Motive) => {
    return <MotiveElement key={motive.id} name={motive.name} />;
  });

  useEffect(() => {
    import("toolcool-range-slider");
  });

  useEffect(() => {
    let motives = Cookies.get("motives");
    if (motives === undefined) {
      setMotives([]);
      return;
    }
    setMotives(JSON.parse(motives));
  }, []);

  function onAddMotive(name: string) {
    setMotives([...motives, { id: nanoid(), name: name }]);
  }

  /*
  Safari doesn't allow writing to the clipboard as the result of a promise, since it's not directly from a user-generated event.
  Instead we need to write the item immediately, but we can defer the evaluation of the promise.
  See: https://stackoverflow.com/questions/65356108/how-to-use-clipboard-api-to-write-image-to-clipboard-in-safari
  */
  function copyToClipboard() {
    if (!myRef.current) {
        return;
    }
    const clipboardItem = new ClipboardItem({
      "image/png": toBlob(myRef.current).then((blob) => {
        if (!blob) {
          toast("Failed to copy :(", {
            type: "error",
            hideProgressBar: true,
            pauseOnHover: false,
            autoClose: 3000,
          });
          return "";
        }
        Cookies.set("motives", JSON.stringify(motives), { expires: 365 });
        toast("Copied to clipboard!", {
          type: "success",
          hideProgressBar: true,
          pauseOnHover: false,
          autoClose: 1000,
        });
        return blob;
      }),
    });
    navigator.clipboard.write([clipboardItem]);
  }

  function clearMotives() {
    Cookies.remove("motives");
    setMotives([]);
  }

  return (
    <>
      <div className="pt-2" ref={myRef}>{renderedMotives}</div>
      <AddMotiveBar
        displayCopy={motives.length !== 0}
        onAddMotive={onAddMotive}
        onCopyToClipboard={copyToClipboard}
        onClear={clearMotives}
      />
      <ToastContainer />
    </>
  );
}