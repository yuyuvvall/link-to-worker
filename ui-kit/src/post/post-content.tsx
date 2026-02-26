import Typography from '@mui/material/Typography'
import './post-content.less'

export type PostContentProps = {
  text: string
  photoUrl?: string
}

const PostContent =({ text, photoUrl }: PostContentProps) => {
  return (
    <div className="post-content">
      <Typography variant="body1" className="post-content__text">
        {text}
      </Typography>
      {photoUrl && (
        <img
          className="post-content__photo"
          src={photoUrl}
          alt="Post content"
        />
      )}
    </div>
  )
}

export default PostContent
