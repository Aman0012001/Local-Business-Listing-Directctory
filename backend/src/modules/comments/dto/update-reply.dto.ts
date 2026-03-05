import { PartialType } from '@nestjs/mapped-types';
import { ReplyCommentDto } from './reply-comment.dto';

export class UpdateReplyDto extends PartialType(ReplyCommentDto) { }
