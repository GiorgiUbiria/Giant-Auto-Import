import "dotenv";
import nodemailer from "nodemailer";

const smtpPassword = process.env.SMPT_PASSWORD;
const smtpEmail = process.env.SMPT_EMAIL;

export async function sendMail({ to, name, subject, body }: { to: string, name: string, subject: string, body: string }) {
	const transport = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: smtpEmail,
			pass: smtpPassword,
		},
	});

	try {
		const testResult = await transport.verify();
		console.log(testResult)
	} catch(err) {
		console.error(err);
	}

	try {
		const sendResult = await transport.sendMail({
			from: smtpEmail, to, subject, html: body,
		});

		console.log(sendResult);
	} catch (err) {
		console.error(err);	
	}
}
