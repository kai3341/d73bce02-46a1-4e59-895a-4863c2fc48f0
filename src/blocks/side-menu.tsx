import React from "react";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
// import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";

// import { HasWrapperGen } from "@wrap-mutant/react";
import { saveAs } from "file-saver";

import { HiddenInput } from "~/components/HiddenInput/HiddenInput";

import {
  myFlowComponentAttrs,
  dataTransferKey,
  drogDropEffectName,
} from "~/components/flow";

import { Config, View, defaultConfigBodyFactory } from "~/lib/migrator";
import { StateMGR } from "~/lib/statemgr";

// type WrappedStateMGR = HasWrapperGen<StateMGR>;
type WrappedStateMGR = StateMGR;

const onDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  nodeType: string,
) => {
  event.dataTransfer.setData(dataTransferKey, nodeType);
  event.dataTransfer.effectAllowed = drogDropEffectName;
};

type RenderFlowNodesProps = {
  statemgr: WrappedStateMGR;
};

const RenderFlowNodes = (props: RenderFlowNodesProps) => {
  const elements = props.statemgr.nodeComponents.map((node) => {
    const meta = node[myFlowComponentAttrs];
    const { key, Body } = meta;
    return (
      <div
        className="react-flow__node"
        key={key}
        onDragStart={(event) => onDragStart(event, key)}
        draggable="true"
      >
        <Body />
      </div>
    );
  });

  return <>{elements}</>;
};

export type SideMenuProps = {
  statemgr: WrappedStateMGR;
  updateStatemgr: () => void;
  closeDrawer: () => void;
};

export const SideMenu = ({
  statemgr,
  updateStatemgr,
  closeDrawer,
}: SideMenuProps) => {
  return (
    <Box className="page-projects-drawer-content">
      <Box className="page-projects-drawer-content-controls">
        <Box>
          <IconButton component="label">
            <HiddenInput
              type="file"
              onChange={async (event) => {
                const { files } = event.target;
                if (files === null) return;
                // FIXME: handle multiple files (?)
                const file = files[0];
                // FIXME: handle invalid files
                const uploadData = await file.text();
                const uploadJSON = JSON.parse(uploadData) as Config;
                statemgr.load(uploadJSON);
                updateStatemgr();
              }}
            >
              <UploadFileIcon />
            </HiddenInput>
          </IconButton>
          <IconButton
            onClick={() => {
              const saveData = statemgr.dump();
              const saveBlob = new Blob([JSON.stringify(saveData)], {
                type: "application/json;charset=utf-8",
              });
              // FIXME: filename = project_name + ext
              saveAs(saveBlob, "flowdata.json");
            }}
          >
            <SaveAltIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              // FIXME: actually we have to open modal and ask does the user sure
              statemgr.loadBody(defaultConfigBodyFactory());
              updateStatemgr();
            }}
          >
            <DeleteForeverIcon color="warning" />
          </IconButton>
          <IconButton
            disabled={statemgr.config.view.type === "catalogue"}
            color={"info"}
            onClick={() => {
              statemgr.toggle({ type: "catalogue" } as View);
              updateStatemgr();
            }}
          >
            <KeyboardDoubleArrowUpIcon />
          </IconButton>
        </Box>
        <CloseIcon className="close clickable" onClick={closeDrawer} />
      </Box>
      <Box className="page-projects-drawer-content-components">
        <RenderFlowNodes statemgr={statemgr} />
      </Box>
    </Box>
  );
};
