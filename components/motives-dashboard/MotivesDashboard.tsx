import { ChangeEvent, KeyboardEvent, SetStateAction, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { nanoid } from "nanoid";
import { toBlob } from "html-to-image";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

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
return (
    <div className="form-group row">
    <label className="col-2 col-form-label align-self-center">{name}</label>
    <div className="col-10 align-self-center">
        <Slider />
    </div>
    </div>
);
}

function Slider() {
  const [percent, setPercent] = useState(50);

  function handleOnChange(e: { target: { value: SetStateAction<number>; }; }) {
    setPercent(e.target.value);
  }

  return (
    <tc-range-slider
      pointer-bg="#fff"
      pointer-bg-focus="#fff"
      pointer-bg-hover="#fff"
      pointer-border="1px solid hsla(0, 0%, 88%, 0.5)"
      pointer-border-hover="1px solid hsla(0, 0%, 88%, 0.5)"
      pointer-border-focus="1px solid hsla(0, 0%, 88%, 0.5)"
      pointer-shadow="0 0 2px rgba(0, 0, 0, 0.8)"
      pointer-shadow-hover="0 0 2px rgba(0, 0, 0, 0.8)"
      pointer-shadow-focus="0 0 2px rgba(0, 0, 0, 0.8)"
      value={percent}
      onChange={handleOnChange}
    />
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

  function copyToClipboard() {
    if (!myRef.current) {
      return;
    }
    toBlob(myRef.current)
      .then((blob) => {
        if (!blob) {
          return;
        }
        return navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
      })
      .then(() => {
        Cookies.set("motives", JSON.stringify(motives), { expires: 365 });
        toast("Copied to clipboard!", {
            type: "success",
            hideProgressBar: true,
            pauseOnHover: false,
            autoClose: 1000,
        });
      }, () => {
        toast("Failed to copy! Check your copy permissions", {
            type: "error",
            hideProgressBar: true,
            pauseOnHover: false,
            autoClose: 3000,
        });
      });
  }

  function clearMotives() {
    Cookies.remove("motives");
    setMotives([]);
  }

  return (
    <>
      <div ref={myRef}>{renderedMotives}</div>
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