declare module 'react-rating-stars-component' {
  export interface ReactStarsProps {
    count?: number;
    value?: number;
    char?: string;
    color?: string;
    activeColor?: string;
    size?: number;
    edit?: boolean;
    isHalf?: boolean;
    emptyIcon?: React.ReactElement;
    halfIcon?: React.ReactElement;
    filledIcon?: React.ReactElement;
    a11y?: boolean;
    onChange?: (newRating: number) => void;
  }

  const ReactStars: React.FC<ReactStarsProps>;
  export default ReactStars;
} 