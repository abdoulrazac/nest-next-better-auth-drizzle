import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ButtonTooltipProps = React.ComponentProps<typeof Button> & {
  tooltipContent: string;
  tooltipClassName?: string;
};

export const ButtonTooltip = ({
  tooltipClassName,
  tooltipContent,
  ...props
}: ButtonTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props} />
      </TooltipTrigger>
      <TooltipContent className={tooltipClassName}>
        <p>{tooltipContent}</p>
      </TooltipContent>
    </Tooltip>
  );
};
