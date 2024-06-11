export const SvgIcon = ({ svg, color, size }) => {
  const SvgComponent = svg;

  return (
    <SvgComponent
      style={{
        width: size,
        height: size,
        fill: color,
      }}
    />
  );
};
